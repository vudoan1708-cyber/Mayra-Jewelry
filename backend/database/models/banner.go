package models

import "time"

type Banner struct {
	Id        uint      `json:"id" gorm:"primaryKey"`
	EnText    string    `json:"enText" gorm:"column:enText"`
	ViText    string    `json:"viText" gorm:"column:viText"`
	Active    bool      `json:"active" gorm:"column:active;default:true"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updatedAt"`
}

func (Banner) TableName() string {
	return "banner"
}
