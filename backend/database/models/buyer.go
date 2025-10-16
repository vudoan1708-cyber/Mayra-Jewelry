package models

import "time"

type Tier string

const (
	SilverTier   Tier = "silver"
	GoldTier     Tier = "gold"
	PlatinumTier Tier = "platinum"
)

type OrderStatus string

const (
	PendingVerification OrderStatus = "pending-verification"
	FailedVerification  OrderStatus = "failed-verification"
	Verified            OrderStatus = "verified"
	Shipped             OrderStatus = "shipped"
)

type Order struct {
	Id                   uint              `json:"id" gorm:"primaryKey"`
	JewelryItems         []JewelryItemInfo `json:"jewelryItems" gorm:"foreignKey:OrderId;references:Id"`
	Status               OrderStatus       `json:"status" gorm:"column:status"`
	PendingAt            time.Time         `json:"pendingAt" gorm:"column:pendingAt;not null;default:now()"`
	FailedVerificationAt *time.Time        `json:"failedVerificationAt" gorm:"column:failedVerificationAt"`
	VerifiedAt           *time.Time        `json:"verifiedAt" gorm:"column:verifiedAt"`
	ShipAt               *time.Time        `json:"shipAt" gorm:"column:shipAt"`
	BuyerId              string            `json:"-" gorm:"column:buyerId"`
}

type Buyer struct {
	Id           string            `json:"id" gorm:"primaryKey"` // Social media platform provided IDs (e.g. Facebook user id)
	Wishlist     []JewelryItemInfo `json:"wishlist" gorm:"foreignKey:WishlistBuyerId;references:Id;column:wishlist"`
	OrderHistory []Order           `json:"orderHistory" gorm:"foreignKey:BuyerId;references:Id;column:orderHistory"`
	Tier         Tier              `json:"tier" gorm:"column:tier"`
	MayraPoint   float32           `json:"mayraPoint" gorm:"column:mayraPoint"`
}

func (Buyer) TableName() string {
	return "buyers"
}
