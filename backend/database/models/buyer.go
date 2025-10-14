package models

type Tier string

const (
	SilverTier   Tier = "silver"
	GoldTier     Tier = "gold"
	PlatinumTier Tier = "platinum"
)

type OrderStatus string

const (
	Pending OrderStatus = "pending"
	Shipped OrderStatus = "shipped"
)

type Order struct {
	Id           uint              `json:"id" gorm:"primaryKey"`
	JewelryItems []JewelryItemInfo `json:"jewelryItems" gorm:"foreignKey:OrderId;references:Id"`
	Status       OrderStatus       `json:"status" gorm:"column:status"`
	BuyerId      string            `json:"-" gorm:"column:buyerId"`
}

type Buyer struct {
	Id           string            `json:"id" gorm:"primaryKey"` // Social media platform provided IDs (e.g. Facebook user id)
	Wishlist     []JewelryItemInfo `json:"wishlist" gorm:"foreignKey:WishlistBuyerId;references:Id"`
	OrderHistory []Order           `json:"orderHistory" gorm:"foreignKey:BuyerId;references:Id"`
	Tier         Tier              `json:"tier" gorm:"column:tier"`
	MayraPoint   uint              `json:"mayraPoint" gorm:"column:mayraPoint"`
}

func (Buyer) TableName() string {
	return "buyers"
}
