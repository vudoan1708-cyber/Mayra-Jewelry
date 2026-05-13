package payment

import (
	"context"
	"strings"
	"testing"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
)

func TestConfirmOrderPayment_RequiresOrderID(t *testing.T) {
	confirmErr := confirmOrderPaymentWithDB(context.Background(), nil, Confirmation{
		Source: SourceManualBank,
		Ref:    "any",
	})
	if confirmErr == nil {
		t.Fatal("expected error when OrderID is empty")
	}
	if !strings.Contains(confirmErr.Error(), "order id required") {
		t.Fatalf("expected 'order id required' error, got: %v", confirmErr)
	}
}

func TestConfirmOrderPayment_RequiresSource(t *testing.T) {
	confirmErr := confirmOrderPaymentWithDB(context.Background(), nil, Confirmation{
		OrderID: "some-order",
		Ref:     "any",
	})
	if confirmErr == nil {
		t.Fatal("expected error when Source is empty")
	}
	if !strings.Contains(confirmErr.Error(), "source required") {
		t.Fatalf("expected 'source required' error, got: %v", confirmErr)
	}
}

func TestConvertMayraPointToTier(t *testing.T) {
	cases := []struct {
		points float32
		want   models.Tier
	}{
		{0, models.SilverTier},
		{50, models.SilverTier},
		{99.9, models.SilverTier},
		{100, models.GoldTier},
		{300, models.GoldTier},
		{599.99, models.GoldTier},
		{600, models.PlatinumTier},
		{900, models.PlatinumTier},
		{1199.99, models.PlatinumTier},
		{1200, models.DiamondTier},
		{5000, models.DiamondTier},
	}
	for _, testCase := range cases {
		got := ConvertMayraPointToTier(testCase.points)
		if got != testCase.want {
			t.Errorf("ConvertMayraPointToTier(%v) = %q, want %q", testCase.points, got, testCase.want)
		}
	}
}
