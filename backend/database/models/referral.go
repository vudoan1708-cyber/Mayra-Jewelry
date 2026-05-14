package models

import "time"

type Referral struct {
	Token           string    `json:"token" gorm:"primaryKey"`
	ReferrerBuyerId string    `json:"referrerBuyerId" gorm:"column:referrerBuyerId;not null;index"`
	ProductId       string    `json:"productId" gorm:"column:productId;not null"`
	CreatedAt       time.Time `json:"createdAt" gorm:"column:createdAt;not null;default:now()"`
	ExpiresAt       time.Time `json:"expiresAt" gorm:"column:expiresAt;not null"`
	IpHash          string    `json:"ipHash" gorm:"column:ipHash"`
}

func (Referral) TableName() string { return "referrals" }

type ReferralCoupon struct {
	Id            string     `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	OwnerBuyerId  string     `json:"ownerBuyerId" gorm:"column:ownerBuyerId;not null;index"`
	Percent       float32    `json:"percent" gorm:"column:percent;not null"`
	UsedAt        *time.Time `json:"usedAt" gorm:"column:usedAt"`
	ExpiresAt     time.Time  `json:"expiresAt" gorm:"column:expiresAt;not null"`
	SourceOrderId string     `json:"sourceOrderId" gorm:"column:sourceOrderId;not null;uniqueIndex"`
	CreatedAt     time.Time  `json:"createdAt" gorm:"column:createdAt;not null;default:now()"`
}

func (ReferralCoupon) TableName() string { return "referral_coupons" }
