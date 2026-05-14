package payment

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const ReferralDiscountPercent = 5
const referralCouponLifetime = 90 * 24 * time.Hour

var (
	ErrReferralNotFound     = errors.New("referral token not found")
	ErrReferralExpired      = errors.New("referral token expired")
	ErrReferralSelfReferral = errors.New("cannot use your own referral token")
	ErrCouponNotFound       = errors.New("coupon not found")
	ErrCouponNotOwned       = errors.New("coupon does not belong to this buyer")
	ErrCouponAlreadyUsed    = errors.New("coupon already used")
	ErrCouponExpired        = errors.New("coupon expired")
)

// ValidateReferralToken loads a referral by token and applies the business
// rules that a recipient's order must satisfy.
func ValidateReferralToken(tx *gorm.DB, token string, buyerId string) (*models.Referral, error) {
	if token == "" {
		return nil, nil
	}
	referral := models.Referral{}
	if loadErr := tx.Model(&models.Referral{}).
		Where(&models.Referral{Token: token}).
		First(&referral).Error; loadErr != nil {
		if errors.Is(loadErr, gorm.ErrRecordNotFound) {
			return nil, ErrReferralNotFound
		}
		return nil, loadErr
	}
	if ruleErr := applyReferralBusinessRules(&referral, buyerId, time.Now()); ruleErr != nil {
		return nil, ruleErr
	}
	return &referral, nil
}

// applyReferralBusinessRules is the pure side of ValidateReferralToken — given a
// loaded Referral, checks the rules that don't require a DB.
func applyReferralBusinessRules(referral *models.Referral, buyerId string, now time.Time) error {
	if !referral.ExpiresAt.IsZero() && referral.ExpiresAt.Before(now) {
		return ErrReferralExpired
	}
	if referral.ReferrerBuyerId == buyerId {
		return ErrReferralSelfReferral
	}
	return nil
}

func applyCouponBusinessRules(coupon *models.ReferralCoupon, buyerId string, now time.Time) error {
	if coupon.OwnerBuyerId != buyerId {
		return ErrCouponNotOwned
	}
	if coupon.UsedAt != nil {
		return ErrCouponAlreadyUsed
	}
	if !coupon.ExpiresAt.IsZero() && coupon.ExpiresAt.Before(now) {
		return ErrCouponExpired
	}
	return nil
}

// ListActiveCouponsForBuyer returns coupons owned by the buyer that are unused
// and not yet expired, ordered by expiry ascending so the soonest-to-expire is
// presented first.
func ListActiveCouponsForBuyer(db *gorm.DB, buyerId string) ([]models.ReferralCoupon, error) {
	coupons := []models.ReferralCoupon{}
	if loadErr := db.Model(&models.ReferralCoupon{}).
		Where(`"ownerBuyerId" = ? AND "usedAt" IS NULL AND "expiresAt" > ?`, buyerId, time.Now()).
		Order(`"expiresAt" ASC`).
		Find(&coupons).Error; loadErr != nil {
		return nil, loadErr
	}
	return coupons, nil
}

// ClaimCoupon atomically marks a coupon as used. Returns the loaded coupon on
// success so callers can record percent + id on the order. The UPDATE includes
// a WHERE used_at IS NULL guard so concurrent claims for the same coupon can't
// double-spend — exactly one wins, the rest see ErrCouponAlreadyUsed.
func ClaimCoupon(tx *gorm.DB, couponId string, buyerId string) (*models.ReferralCoupon, error) {
	if couponId == "" {
		return nil, nil
	}
	coupon := models.ReferralCoupon{}
	if loadErr := tx.Model(&models.ReferralCoupon{}).
		Where(&models.ReferralCoupon{Id: couponId}).
		First(&coupon).Error; loadErr != nil {
		if errors.Is(loadErr, gorm.ErrRecordNotFound) {
			return nil, ErrCouponNotFound
		}
		return nil, loadErr
	}
	if ruleErr := applyCouponBusinessRules(&coupon, buyerId, time.Now()); ruleErr != nil {
		return nil, ruleErr
	}
	now := time.Now()
	result := tx.Model(&models.ReferralCoupon{}).
		Where(`"id" = ? AND "usedAt" IS NULL`, couponId).
		Update("usedAt", &now)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, ErrCouponAlreadyUsed
	}
	coupon.UsedAt = &now
	return &coupon, nil
}

// awardReferralCoupon issues a ReferralCoupon to the referrer when their
// referred order is verified. UNIQUE(source_order_id) makes this idempotent —
// repeated verification triggers (or webhook retries) become no-ops.
func awardReferralCoupon(tx *gorm.DB, order *models.Order) error {
	if order.ReferralToken == "" {
		return nil
	}
	referral, validateErr := ValidateReferralToken(tx, order.ReferralToken, order.BuyerId)
	if validateErr != nil {
		log.Printf("awardReferralCoupon: order %s has invalid referral token (%s); skipping", order.Id, validateErr.Error())
		return nil
	}
	if referral == nil {
		return nil
	}
	coupon := models.ReferralCoupon{
		OwnerBuyerId:  referral.ReferrerBuyerId,
		Percent:       ReferralDiscountPercent,
		ExpiresAt:     time.Now().Add(referralCouponLifetime),
		SourceOrderId: order.Id,
	}
	if insertErr := tx.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "sourceOrderId"}},
		DoNothing: true,
	}).Create(&coupon).Error; insertErr != nil {
		return fmt.Errorf("insert referral coupon: %w", insertErr)
	}
	log.Printf("awardReferralCoupon: referrer=%s order=%s coupon=%s", referral.ReferrerBuyerId, order.Id, coupon.Id)
	return nil
}
