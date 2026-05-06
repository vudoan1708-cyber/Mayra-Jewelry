package admin_cms

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"gorm.io/gorm"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

type bannerRequest struct {
	EnText *string `json:"enText,omitempty"`
	ViText *string `json:"viText,omitempty"`
	Active *bool   `json:"active,omitempty"`
}

func UpdateBanner(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	defer r.Body.Close()

	var req bannerRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tx := database.DatabaseInstance.Gorm.WithContext(r.Context())
	banner := models.Banner{}
	err := tx.First(&banner).Error
	notFound := errors.Is(err, gorm.ErrRecordNotFound)
	if err != nil && !notFound {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	if req.EnText != nil {
		banner.EnText = *req.EnText
	}
	if req.ViText != nil {
		banner.ViText = *req.ViText
	}
	if req.Active != nil {
		banner.Active = *req.Active
	}
	banner.UpdatedAt = time.Now()

	if notFound {
		if err := tx.Create(&banner).Error; err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else {
		if err := tx.Save(&banner).Error; err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	writeAudit(r.Context(), adminID(r), "banner.update", "", req)
	middleware.HandleResponse(w, banner)
}
