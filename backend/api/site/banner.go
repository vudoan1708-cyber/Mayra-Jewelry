package site

import (
	"errors"
	"net/http"

	"gorm.io/gorm"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

func GetBanner(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	banner := models.Banner{}
	err := database.DatabaseInstance.Gorm.WithContext(r.Context()).First(&banner).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		middleware.HandleResponse(w, nil)
		return
	}
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	middleware.HandleResponse(w, banner)
}
