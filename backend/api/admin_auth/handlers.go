package admin_auth

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

const (
	maxFailedAttempts = 5
	lockoutDuration   = 15 * time.Minute
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	PendingToken string `json:"pendingToken"`
}

type totpRequest struct {
	PendingToken string `json:"pendingToken"`
	Code         string `json:"code"`
}

type sessionResponse struct {
	SessionToken string `json:"sessionToken"`
	Email        string `json:"email"`
	ExpiresIn    int64  `json:"expiresIn"`
}

type whoamiResponse struct {
	Id    string `json:"id"`
	Email string `json:"email"`
}

func decode(r *http.Request, dst any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	var req loginRequest
	if err := decode(r, &req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "email and password are required")
		return
	}

	admin := models.AdminUser{}
	tx := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Where(&models.AdminUser{Email: req.Email}).
		First(&admin)
	if tx.Error != nil {
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if admin.Disabled {
		middleware.HandleErrorResponse(w, http.StatusForbidden, "account disabled")
		return
	}
	if admin.LockedUntil != nil && admin.LockedUntil.After(time.Now()) {
		middleware.HandleErrorResponse(w, http.StatusLocked, "Account temporarily locked, try again later")
		return
	}

	ok, err := VerifyPassword(req.Password, admin.PasswordHash)
	if err != nil || !ok {
		registerFailedAttempt(&admin)
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	pending, err := IssuePendingToken(admin.Id)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not issue pending token")
		return
	}
	middleware.HandleResponse(w, loginResponse{PendingToken: pending})
}

func VerifyTotp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	var req totpRequest
	if err := decode(r, &req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Code = strings.TrimSpace(req.Code)
	if req.PendingToken == "" || req.Code == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "pendingToken and code are required")
		return
	}

	claims, err := ParseToken(req.PendingToken)
	if err != nil || claims.Type != TokenTypePending {
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "pending token invalid or expired")
		return
	}

	admin := models.AdminUser{}
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Where(&models.AdminUser{Id: claims.Subject}).
		First(&admin).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "admin not found")
		return
	}
	if admin.Disabled {
		middleware.HandleErrorResponse(w, http.StatusForbidden, "account disabled")
		return
	}
	if admin.LockedUntil != nil && admin.LockedUntil.After(time.Now()) {
		middleware.HandleErrorResponse(w, http.StatusLocked, "Account temporarily locked, try again later")
		return
	}

	valid, err := ValidateTotpCode(req.Code, admin.TotpSecretCipher, admin.TotpSecretNonce)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not validate totp")
		return
	}
	if !valid {
		registerFailedAttempt(&admin)
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "invalid totp code")
		return
	}

	now := time.Now()
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Model(&models.AdminUser{}).
		Where(&models.AdminUser{Id: admin.Id}).
		Updates(map[string]any{
			"failedAttempts": 0,
			"lockedUntil":    nil,
			"lastLoginAt":    &now,
		}).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not finalize login")
		return
	}

	session, err := IssueSessionToken(admin.Id, admin.Email)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "could not issue session token")
		return
	}
	middleware.HandleResponse(w, sessionResponse{
		SessionToken: session,
		Email:        admin.Email,
		ExpiresIn:    int64(sessionTokenTTL.Seconds()),
	})
}

func Whoami(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	claims, ok := AdminFromContext(r.Context())
	if !ok {
		middleware.HandleErrorResponse(w, http.StatusUnauthorized, "no admin in context")
		return
	}
	middleware.HandleResponse(w, whoamiResponse{Id: claims.Subject, Email: claims.Email})
}

func registerFailedAttempt(admin *models.AdminUser) {
	admin.FailedAttempts++
	updates := map[string]any{
		"failedAttempts": admin.FailedAttempts,
	}
	if admin.FailedAttempts >= maxFailedAttempts {
		until := time.Now().Add(lockoutDuration)
		updates["lockedUntil"] = &until
		updates["failedAttempts"] = 0
	}
	database.DatabaseInstance.Gorm.
		Model(&models.AdminUser{}).
		Where(&models.AdminUser{Id: admin.Id}).
		Updates(updates)
}
