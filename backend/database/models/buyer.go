package models

type Tier string

const (
	SilverTier   Tier = "silver"
	GoldTier     Tier = "gold"
	PlatinumTier Tier = "platinum"
)

type Buyer struct {
	Id         uint              `json:"id" gorm:"primaryKey"` // Social media platform provided IDs (e.g. Facebook user id)
	Wishlist   []JewelryItemInfo `json:"wishlist" gorm:"foreignKey:BuyerId;references:DirectoryId"`
	Tier       Tier              `json:"tier" gorm:"tier"`
	MayraPoint uint              `json:"mayraPoint" gorm:"mayraPoint"`
}

func (Buyer) TableName() string {
	return "buyer"
}
