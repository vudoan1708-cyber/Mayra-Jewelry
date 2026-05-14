package payment

import (
	"testing"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
)

func TestApplyReferralBusinessRules_ExpiredReferralRejected(t *testing.T) {
	now := time.Now()
	referral := &models.Referral{
		Token:           "tok-expired",
		ReferrerBuyerId: "anna",
		ExpiresAt:       now.Add(-time.Hour),
	}
	if err := applyReferralBusinessRules(referral, "ben", now); err != ErrReferralExpired {
		t.Fatalf("expected ErrReferralExpired, got %v", err)
	}
}

func TestApplyReferralBusinessRules_SelfReferralRejected(t *testing.T) {
	now := time.Now()
	referral := &models.Referral{
		Token:           "tok-self",
		ReferrerBuyerId: "anna",
		ExpiresAt:       now.Add(time.Hour),
	}
	if err := applyReferralBusinessRules(referral, "anna", now); err != ErrReferralSelfReferral {
		t.Fatalf("expected ErrReferralSelfReferral, got %v", err)
	}
}

func TestApplyReferralBusinessRules_ValidReferralPasses(t *testing.T) {
	now := time.Now()
	referral := &models.Referral{
		Token:           "tok-valid",
		ReferrerBuyerId: "anna",
		ExpiresAt:       now.Add(time.Hour),
	}
	if err := applyReferralBusinessRules(referral, "ben", now); err != nil {
		t.Fatalf("expected no error for valid referral, got %v", err)
	}
}

func TestApplyReferralBusinessRules_ZeroExpiryTreatedAsNoExpiry(t *testing.T) {
	now := time.Now()
	referral := &models.Referral{
		Token:           "tok-no-expiry",
		ReferrerBuyerId: "anna",
		ExpiresAt:       time.Time{},
	}
	if err := applyReferralBusinessRules(referral, "ben", now); err != nil {
		t.Fatalf("zero ExpiresAt should not be treated as expired, got %v", err)
	}
}

func TestReferralDiscountPercent_Is5(t *testing.T) {
	if ReferralDiscountPercent != 5 {
		t.Fatalf("expected ReferralDiscountPercent=5, got %d", ReferralDiscountPercent)
	}
}

func TestApplyCouponBusinessRules_NotOwned(t *testing.T) {
	now := time.Now()
	coupon := &models.ReferralCoupon{
		Id:           "cpn-1",
		OwnerBuyerId: "anna",
		ExpiresAt:    now.Add(24 * time.Hour),
	}
	if err := applyCouponBusinessRules(coupon, "ben", now); err != ErrCouponNotOwned {
		t.Fatalf("expected ErrCouponNotOwned, got %v", err)
	}
}

func TestApplyCouponBusinessRules_AlreadyUsed(t *testing.T) {
	now := time.Now()
	used := now.Add(-time.Minute)
	coupon := &models.ReferralCoupon{
		Id:           "cpn-2",
		OwnerBuyerId: "anna",
		UsedAt:       &used,
		ExpiresAt:    now.Add(24 * time.Hour),
	}
	if err := applyCouponBusinessRules(coupon, "anna", now); err != ErrCouponAlreadyUsed {
		t.Fatalf("expected ErrCouponAlreadyUsed, got %v", err)
	}
}

func TestApplyCouponBusinessRules_Expired(t *testing.T) {
	now := time.Now()
	coupon := &models.ReferralCoupon{
		Id:           "cpn-3",
		OwnerBuyerId: "anna",
		ExpiresAt:    now.Add(-time.Hour),
	}
	if err := applyCouponBusinessRules(coupon, "anna", now); err != ErrCouponExpired {
		t.Fatalf("expected ErrCouponExpired, got %v", err)
	}
}

func TestApplyCouponBusinessRules_ValidPasses(t *testing.T) {
	now := time.Now()
	coupon := &models.ReferralCoupon{
		Id:           "cpn-4",
		OwnerBuyerId: "anna",
		ExpiresAt:    now.Add(24 * time.Hour),
	}
	if err := applyCouponBusinessRules(coupon, "anna", now); err != nil {
		t.Fatalf("expected no error for valid coupon, got %v", err)
	}
}

func TestApplyCouponBusinessRules_ZeroExpiryNotTreatedAsExpired(t *testing.T) {
	now := time.Now()
	coupon := &models.ReferralCoupon{
		Id:           "cpn-5",
		OwnerBuyerId: "anna",
		ExpiresAt:    time.Time{},
	}
	if err := applyCouponBusinessRules(coupon, "anna", now); err != nil {
		t.Fatalf("zero ExpiresAt should not be treated as expired, got %v", err)
	}
}
