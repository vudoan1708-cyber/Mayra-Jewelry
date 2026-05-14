package api

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/payment"
	"gorm.io/gorm"
)

const referralTokenLifetime = 60 * 24 * time.Hour
const referralTokenByteLength = 8

type createReferralTokenResponse struct {
	Token string `json:"token"`
}

// CreateReferralToken issues a shareable token bound to (buyer, product).
// Share is a privileged feature — only authentic Mayra users can mint tokens.
// The frontend gates this by requiring NextAuth sign-in and running the Buyer
// upsert; the backend enforces the same invariant by 404-ing if no Buyer row
// exists for the supplied buyerId. Repeat clicks on the same product return
// the existing active token.
func CreateReferralToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	if parseErr := r.ParseMultipartForm(10 << 20); parseErr != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, parseErr.Error())
		return
	}
	data := r.MultipartForm.Value

	if data["buyerId"] == nil || data["buyerId"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerId is missing from the payload")
		return
	}
	if data["productId"] == nil || data["productId"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "productId is missing from the payload")
		return
	}
	referrerBuyerId := data["buyerId"][0]
	productId := data["productId"][0]

	buyer := models.Buyer{}
	if loadErr := database.DatabaseInstance.Gorm.Model(&models.Buyer{}).
		Where(&models.Buyer{Id: referrerBuyerId}).
		First(&buyer).Error; loadErr != nil {
		if errors.Is(loadErr, gorm.ErrRecordNotFound) {
			middleware.HandleErrorResponse(w, http.StatusNotFound, "Mayra user not found; please sign in to share")
			return
		}
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, loadErr.Error())
		return
	}

	var token string
	if txErr := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		existing := models.Referral{}
		findErr := tx.Model(&models.Referral{}).
			Where(`"referrerBuyerId" = ? AND "productId" = ? AND "expiresAt" > ?`,
				referrerBuyerId, productId, time.Now()).
			First(&existing).Error
		if findErr == nil {
			token = existing.Token
			return nil
		}
		if !errors.Is(findErr, gorm.ErrRecordNotFound) {
			return findErr
		}

		freshToken, tokenErr := helpers.GenerateToken(referralTokenByteLength)
		if tokenErr != nil {
			return tokenErr
		}
		referral := models.Referral{
			Token:           freshToken,
			ReferrerBuyerId: referrerBuyerId,
			ProductId:       productId,
			ExpiresAt:       time.Now().Add(referralTokenLifetime),
		}
		if createErr := tx.Create(&referral).Error; createErr != nil {
			return createErr
		}
		token = freshToken
		return nil
	}); txErr != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, txErr.Error())
		return
	}

	log.Printf("CreateReferralToken: buyer=%s product=%s token=%s", referrerBuyerId, productId, token)
	middleware.HandleResponse(w, createReferralTokenResponse{Token: token})
}

type buyerReferralCoupon struct {
	Id        string    `json:"id"`
	Percent   float32   `json:"percent"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}

func ListBuyerReferralCoupons(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	vars := mux.Vars(r)
	buyerId := vars["buyerId"]
	if buyerId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerId is missing from the path")
		return
	}
	coupons, loadErr := payment.ListActiveCouponsForBuyer(database.DatabaseInstance.Gorm, buyerId)
	if loadErr != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, loadErr.Error())
		return
	}
	response := helpers.MapFunc(coupons, func(coupon models.ReferralCoupon, _ int) buyerReferralCoupon {
		return buyerReferralCoupon{
			Id:        coupon.Id,
			Percent:   coupon.Percent,
			ExpiresAt: coupon.ExpiresAt,
			CreatedAt: coupon.CreatedAt,
		}
	})
	middleware.HandleResponse(w, response)
}
