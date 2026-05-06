package models

import "time"

type AdminUser struct {
	Id               string     `json:"id" gorm:"primaryKey;column:id"`
	Email            string     `json:"email" gorm:"uniqueIndex;column:email;not null"`
	PasswordHash     string     `json:"-" gorm:"column:passwordHash;not null"`
	TotpSecretCipher []byte     `json:"-" gorm:"column:totpSecretCipher;not null"`
	TotpSecretNonce  []byte     `json:"-" gorm:"column:totpSecretNonce;not null"`
	Disabled         bool       `json:"disabled" gorm:"column:disabled;default:false"`
	FailedAttempts   int        `json:"-" gorm:"column:failedAttempts;default:0"`
	LockedUntil      *time.Time `json:"lockedUntil,omitempty" gorm:"column:lockedUntil"`
	LastLoginAt      *time.Time `json:"lastLoginAt,omitempty" gorm:"column:lastLoginAt"`
	CreatedAt        time.Time  `json:"createdAt" gorm:"column:createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt" gorm:"column:updatedAt"`
}

func (AdminUser) TableName() string {
	return "admin_users"
}
