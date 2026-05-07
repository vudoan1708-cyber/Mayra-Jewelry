package admin_cms

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/admin_auth"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

type adminListItem struct {
	Id          string  `json:"id"`
	Email       string  `json:"email"`
	Disabled    bool    `json:"disabled"`
	LockedUntil *string `json:"lockedUntil,omitempty"`
	LastLoginAt *string `json:"lastLoginAt,omitempty"`
	CreatedAt   string  `json:"createdAt"`
}

type createAdminRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type createAdminResponse struct {
	Id         string `json:"id"`
	Email      string `json:"email"`
	OtpAuthURL string `json:"otpauthURL"`
}

type updateAdminRequest struct {
	Disabled *bool `json:"disabled,omitempty"`
}

func newAdminID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func ListAdmins(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	admins := []models.AdminUser{}
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Order("\"createdAt\" ASC").
		Find(&admins).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := make([]adminListItem, 0, len(admins))
	for _, a := range admins {
		item := adminListItem{
			Id:        a.Id,
			Email:     a.Email,
			Disabled:  a.Disabled,
			CreatedAt: a.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		}
		if a.LockedUntil != nil {
			s := a.LockedUntil.UTC().Format("2006-01-02T15:04:05Z")
			item.LockedUntil = &s
		}
		if a.LastLoginAt != nil {
			s := a.LastLoginAt.UTC().Format("2006-01-02T15:04:05Z")
			item.LastLoginAt = &s
		}
		response = append(response, item)
	}
	middleware.HandleResponse(w, response)
}

func CreateAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	defer r.Body.Close()
	var req createAdminRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "valid email is required")
		return
	}
	if len(req.Password) < 12 {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "password must be at least 12 characters")
		return
	}

	tx := database.DatabaseInstance.Gorm.WithContext(r.Context())
	existing := models.AdminUser{}
	err := tx.Where(&models.AdminUser{Email: req.Email}).First(&existing).Error
	if err == nil {
		middleware.HandleErrorResponse(w, http.StatusConflict, "an admin with that email already exists")
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	hash, err := admin_auth.HashPassword(req.Password)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not hash password")
		return
	}
	otpAuthURL, plainSecret, err := admin_auth.GenerateTotpSecret(req.Email)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not generate totp secret")
		return
	}
	cipher, nonce, err := admin_auth.EncryptTotpSecret(plainSecret)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not encrypt totp secret")
		return
	}
	id, err := newAdminID()
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not generate id")
		return
	}
	admin := models.AdminUser{
		Id:               id,
		Email:            req.Email,
		PasswordHash:     hash,
		TotpSecretCipher: cipher,
		TotpSecretNonce:  nonce,
	}
	if err := tx.Create(&admin).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeAudit(r.Context(), adminID(r), "admin.create", id, map[string]any{"email": req.Email})
	middleware.HandleResponse(w, createAdminResponse{
		Id:         id,
		Email:      req.Email,
		OtpAuthURL: otpAuthURL,
	})
}

func UpdateAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	targetId := mux.Vars(r)["id"]
	if targetId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "id is required")
		return
	}
	defer r.Body.Close()
	var req updateAdminRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Disabled == nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "no fields to update")
		return
	}
	caller := adminID(r)
	if *req.Disabled && caller != "" && caller == targetId {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "you cannot disable your own account")
		return
	}

	updates := map[string]any{"disabled": *req.Disabled}
	if !*req.Disabled {
		updates["failedAttempts"] = 0
		updates["lockedUntil"] = nil
	}
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Model(&models.AdminUser{}).
		Where(&models.AdminUser{Id: targetId}).
		Updates(updates).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeAudit(r.Context(), caller, "admin.update", targetId, req)
	middleware.HandleResponse(w, nil)
}
