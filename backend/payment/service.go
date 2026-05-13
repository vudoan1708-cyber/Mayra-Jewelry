package payment

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"gorm.io/gorm"
)

var (
	ErrOrderNotFound    = errors.New("order not found")
	ErrBuyerMismatch    = errors.New("confirmation buyer id does not match order")
	ErrAlreadyConfirmed = errors.New("order already confirmed with a different payment reference")
)

// ConfirmOrderPayment is the single entry point for transitioning an order from
// pending to verified. Every payment path (admin email link, future webhooks)
// funnels through this so side effects fire identically. Re-confirming with the
// same Source+Ref is a no-op success — webhook retries depend on this.
func ConfirmOrderPayment(ctx context.Context, confirmation Confirmation) error {
	return confirmOrderPaymentWithDB(ctx, database.DatabaseInstance.Gorm, confirmation)
}

func confirmOrderPaymentWithDB(_ context.Context, db *gorm.DB, confirmation Confirmation) error {
	if confirmation.OrderID == "" {
		return fmt.Errorf("confirm payment: order id required")
	}
	if confirmation.Source == "" {
		return fmt.Errorf("confirm payment: source required")
	}
	if confirmation.PaidAt.IsZero() {
		confirmation.PaidAt = time.Now()
	}

	return db.Transaction(func(tx *gorm.DB) error {
		order := models.Order{}
		if loadErr := tx.Preload("OrderJewelryItems").
			Where(&models.Order{Id: confirmation.OrderID}).
			First(&order).Error; loadErr != nil {
			if errors.Is(loadErr, gorm.ErrRecordNotFound) {
				return ErrOrderNotFound
			}
			return loadErr
		}

		if confirmation.BuyerID != "" && confirmation.BuyerID != order.BuyerId {
			return ErrBuyerMismatch
		}

		if order.Status == models.Verified {
			if order.PaymentSource == string(confirmation.Source) && order.PaymentRef == confirmation.Ref {
				log.Printf("ConfirmOrderPayment: order %s already verified with same ref; no-op", confirmation.OrderID)
				return nil
			}
			return ErrAlreadyConfirmed
		}

		paidAt := confirmation.PaidAt
		order.Status = models.Verified
		order.VerifiedAt = &paidAt
		order.PaymentSource = string(confirmation.Source)
		order.PaymentRef = confirmation.Ref

		if updateErr := tx.Model(&order).
			Where(&models.Order{Id: order.Id}).
			Select([]string{"status", "verifiedAt", "paymentSource", "paymentRef"}).
			Updates(&order).Error; updateErr != nil {
			return updateErr
		}

		if effectsErr := applyOrderConfirmationEffects(tx, &order); effectsErr != nil {
			return effectsErr
		}

		log.Printf("ConfirmOrderPayment: order %s verified via %s (ref=%s)", confirmation.OrderID, confirmation.Source, confirmation.Ref)
		return nil
	})
}

func applyOrderConfirmationEffects(tx *gorm.DB, order *models.Order) error {
	directoryIds := helpers.MapFunc(order.OrderJewelryItems, func(item models.OrderJewelryItem, _ int) string {
		return item.JewelryId
	})
	if len(directoryIds) == 0 {
		return nil
	}

	jewelryItems := []models.JewelryItemInfo{}
	if loadErr := tx.Preload("Prices").Model(&models.JewelryItemInfo{}).
		Where("\"directoryId\" IN ?", directoryIds).
		Find(&jewelryItems).Error; loadErr != nil {
		return fmt.Errorf("load jewelry items: %w", loadErr)
	}

	quantityByJewelry := map[string]uint{}
	for _, orderJewelry := range order.OrderJewelryItems {
		quantityByJewelry[orderJewelry.JewelryId] = orderJewelry.Quantity
	}

	var earnedMayraPoint float32
	for _, item := range jewelryItems {
		quantity := quantityByJewelry[item.DirectoryId]
		if len(item.Prices) == 0 || quantity == 0 {
			continue
		}
		// TODO: only first (Silver) Prices entry; expand when other materials become relevant.
		discount := helpers.FalsyFallback(item.Prices[0].Discount, 0)
		afterDiscount := float32(item.Prices[0].Amount*int32(quantity)) * (1 - discount)
		earnedMayraPoint += afterDiscount / 10000

		newPurchaseCount := item.Purchases + quantity
		if updateErr := tx.Model(&models.JewelryItemInfo{}).
			Where("\"directoryId\" = ?", item.DirectoryId).
			Select("purchases").
			Update("purchases", newPurchaseCount).Error; updateErr != nil {
			return fmt.Errorf("update purchases for %s: %w", item.DirectoryId, updateErr)
		}
	}

	buyer := models.Buyer{}
	if loadErr := tx.Model(&models.Buyer{}).
		Where(&models.Buyer{Id: order.BuyerId}).
		First(&buyer).Error; loadErr != nil {
		return fmt.Errorf("load buyer %s: %w", order.BuyerId, loadErr)
	}
	totalPoint := buyer.MayraPoint + earnedMayraPoint
	if updateErr := tx.Model(&buyer).
		Where(&models.Buyer{Id: order.BuyerId}).
		Select([]string{"tier", "mayraPoint"}).
		Updates(map[string]any{
			"tier":       ConvertMayraPointToTier(totalPoint),
			"mayraPoint": totalPoint,
		}).Error; updateErr != nil {
		return fmt.Errorf("update buyer points: %w", updateErr)
	}
	return nil
}

func ConvertMayraPointToTier(mayraPoint float32) models.Tier {
	switch {
	case mayraPoint < 100:
		return models.SilverTier
	case mayraPoint < 600:
		return models.GoldTier
	case mayraPoint < 1200:
		return models.PlatinumTier
	default:
		return models.DiamondTier
	}
}
