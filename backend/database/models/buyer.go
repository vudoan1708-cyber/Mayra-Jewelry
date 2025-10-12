package models

type Tier string

const (
	SilverTier   Tier = "silver"
	GoldTier     Tier = "gold"
	PlatinumTier Tier = "platinum"
)

type Buyer struct {
	Id           string            `json:"id" gorm:"primaryKey"` // Social media platform provided IDs (e.g. Facebook user id)
	Wishlist     []JewelryItemInfo `json:"wishlist" gorm:"foreignKey:WishlistBuyerId;references:Id"`
	OrderHistory []JewelryItemInfo `json:"orderHistory" gorm:"foreignKey:OrderBuyerId;references:Id"`
	Tier         Tier              `json:"tier" gorm:"column:tier"`
	MayraPoint   uint              `json:"mayraPoint" gorm:"column:mayraPoint"`
}

func (Buyer) TableName() string {
	return "buyers"
}
