package models

import "time"

type AdminAuditLog struct {
	Id        uint      `json:"id" gorm:"primaryKey"`
	AdminId   string    `json:"adminId" gorm:"column:adminId;not null;index"`
	Action    string    `json:"action" gorm:"column:action;not null"`
	Resource  string    `json:"resource" gorm:"column:resource"`
	Details   string    `json:"details" gorm:"column:details;type:text"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:createdAt;index"`
}

func (AdminAuditLog) TableName() string {
	return "admin_audit_log"
}
