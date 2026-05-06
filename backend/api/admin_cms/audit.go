package admin_cms

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
)

func writeAudit(ctx context.Context, adminId, action, resource string, details any) {
	encoded := ""
	if details != nil {
		b, err := json.Marshal(details)
		if err != nil {
			log.Printf("audit: marshal details failed: %v", err)
			return
		}
		encoded = string(b)
	}
	entry := models.AdminAuditLog{
		AdminId:   adminId,
		Action:    action,
		Resource:  resource,
		Details:   encoded,
		CreatedAt: time.Now(),
	}
	if err := database.DatabaseInstance.Gorm.WithContext(ctx).Create(&entry).Error; err != nil {
		log.Printf("audit: insert failed: %v", err)
	}
}
