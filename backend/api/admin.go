package api

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/resend/resend-go/v2"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/session"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	nonDbModels "github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/models"
	"gorm.io/gorm"
)

func sendPaymentVerifiedEmail(buyerEmail, productName string) error {
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	params := &resend.SendEmailRequest{
		From:    "Mayra Jewelry <onboarding@resend.dev>",
		To:      []string{buyerEmail},
		Subject: fmt.Sprintf("Payment for %s has been verified.", productName),
		Html: `<p>Thank you for ordering at Mayra Jewelry.</p>
			<p>We are contacting our shipping agency now and will get the order shipped to you in no time</p>
			`,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	fmt.Println("sent.Id", sent.Id)
	return nil
}

func convertMayraPointToTier(mayraPoint float32) models.Tier {
	switch {
	case mayraPoint < 100:
		return models.SilverTier
	case mayraPoint < 600:
		return models.GoldTier
	case mayraPoint < 1200:
		return models.PlatinumTier
	case mayraPoint >= 1200:
		return models.DiamondTier
	default:
		return ""
	}
}

func ConfirmPaymentAndVerifyOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	r.ParseMultipartForm(10 << 20)

	data := r.MultipartForm.Value

	if data["id"] == nil || data["id"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "id is missing from payload")
		return
	}

	// Step 1: Decode and Decrypt the cypher text, then Cast to the a struct
	encryptedId, decode_err := base64.URLEncoding.DecodeString(data["id"][0])
	if decode_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, decode_err.Error())
		return
	}
	foundSession, ok := session.UserSessionFactory.GetSessionByCypherText(encryptedId)
	if !ok {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "Could not get a session via cypher text")
		return
	}
	decrypted, decrypt_err := helpers.Decrypt(foundSession.CypherText, foundSession.CypherKey, foundSession.Nonce)
	if decrypt_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, decrypt_err.Error())
		return
	}

	encryptionData := nonDbModels.EncryptionData{}
	if cast_err := json.Unmarshal(decrypted, &encryptionData); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
		return
	}

	// Step 2: Get buyerId and orderId from that data and fetch a PENDING order of the specified buyer
	pendingOrder := models.Order{}
	var orderId string
	var buyerId string
	database.DatabaseInstance.Gorm.Preload("OrderJewelryItems").Model(&pendingOrder).
		Where(&models.Order{Id: encryptionData.OrderId, BuyerId: encryptionData.BuyerId}).
		Find(&pendingOrder)

	// Step 3: Update Order status to Verified
	verifiedAt := time.Now()
	pendingOrder.Status = models.Verified
	pendingOrder.VerifiedAt = &verifiedAt
	// Step 4: Get all jewelry items from the pending order
	jewelryItems := []models.JewelryItemInfo{}
	directoryIds := helpers.MapFunc(pendingOrder.OrderJewelryItems, func(item models.OrderJewelryItem, _ int) string {
		return item.JewelryId
	})
	if get_jewelry_err := database.DatabaseInstance.Gorm.Preload("Prices").Model(&models.JewelryItemInfo{}).
		Where("\"directoryId\" IN ?", directoryIds).
		Find(&jewelryItems).Error; get_jewelry_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, get_jewelry_err.Error())
		return
	}
	// Step 5: Add points and upgrade tier if necessary
	var mayraPoint float32
	for idx, item := range jewelryItems {
		// TODO: This only counts the first item (Silver) in the Prices array, needs further expanding if other materials become relevant
		afterDiscount := float32(item.Prices[0].Amount*int32(pendingOrder.OrderJewelryItems[idx].Quantity)) * (1 - helpers.FalsyFallback(item.Prices[0].Discount, 0))
		mayraPoint += afterDiscount / 10000
	}

	if tx_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		// Step 6: Update number of purchases for the items
		for idx, item := range jewelryItems {
			newPurchaseCount := item.Purchases + pendingOrder.OrderJewelryItems[idx].Quantity
			if update_err := tx.Model(&models.JewelryItemInfo{}).
				Where("\"directoryId\" = ?", item.DirectoryId).
				Select("purchases").
				Update("purchases", newPurchaseCount).Error; update_err != nil {
				log.Printf("Error when updating purchases for ordered items. Reason: %s", update_err.Error())
				return update_err
			}
		}
		buyer := models.Buyer{}
		// Get a buyer with a provided ID
		if get_error := getOneBuyer(tx, buyerId, &buyer, "*"); get_error != nil {
			log.Printf("Cannot get the buyer with ID: %s. Reason: %s", buyerId, get_error.Error())
			// If error, it's likely that the user doesn't exist
			if strings.Contains(get_error.Error(), "not found") {
				if create_err := createNewUser(tx, &buyer, data); create_err != nil {
					return fmt.Errorf("error when trying to create a new user after a passed in user ID not being found. Reason: %s", create_err.Error())
				}
			} else {
				return get_error
			}
		}
		// Step 7: Update Order database table based on column ID conflict
		if jewelry_db_err := tx.Model(&pendingOrder).
			Where(&models.Order{Id: orderId, BuyerId: buyerId}).
			Select([]string{"status", "verifiedAt"}).
			Updates(&pendingOrder).Error; jewelry_db_err != nil {
			return jewelry_db_err
		}

		// Step 8: Update Buyer points and tier
		totalPoint := buyer.MayraPoint + mayraPoint
		if update_err := tx.Model(&buyer).
			Where(&models.Buyer{Id: buyerId}).
			Select([]string{"tier", "mayraPoint"}).
			Updates(map[string]any{
				"tier":       convertMayraPointToTier(totalPoint),
				"mayraPoint": totalPoint,
			}).Error; update_err != nil {
			return update_err
		}

		// Non-MVP step: Sending Notification to the user saying the pending order has been approved
		// productNames := helpers.MapFunc(jewelryItems, func(item models.JewelryItemInfo, nil int) string {
		// 	return item.ItemName
		// })
		// return sendPaymentVerifiedEmail(encryptionData.BuyerEmail, strings.Join(productNames, ", "))
		return nil
	}); tx_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, tx_err.Error())
		return
	}

	middleware.HandleResponse(w, nil)
}
