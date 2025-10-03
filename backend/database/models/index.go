package models

import "time"

type JewelryVariation string

const (
	Silver    JewelryVariation = "Silver"
	Gold      JewelryVariation = "Gold"
	WhiteGold JewelryVariation = "White Gold"
)

type JewelryPrice struct {
	Variation JewelryVariation `json:"variation"`
	Price     int32            `json:"price"`
}

type JewelryItemInfo struct {
	ItemId    string         `json:"itemId"` // base64 representation of the path to the file
	Name      string         `json:"name"`   // the item's name
	Prices    []JewelryPrice `json:"prices"`
	CreatedAt time.Time      `json:"created_at"`
}
