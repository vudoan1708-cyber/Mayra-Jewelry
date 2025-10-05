package helpers

import (
	"reflect"
	"testing"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
)

func TestCastStringToAnyType(t *testing.T) {
	var convertedPrices models.JewelryPrice

	originalData := `{
		"variation": "Gold",
		"amount":    1000
	}`

	CastStringToAnyType(originalData, &convertedPrices)

	want := models.JewelryPrice{
		Variation: "Gold",
		Amount:    1000,
	}

	if !reflect.DeepEqual(convertedPrices, want) {
		t.Errorf("convertedPrices: %+v does not deep equal to %+v", convertedPrices, want)
	}
}
