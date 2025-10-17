package api

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/session"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func convertMayraPointToTier(mayraPoint float32) models.Tier {
	switch {
	case mayraPoint < 50:
		return models.SilverTier
	case mayraPoint < 400:
		return models.GoldTier
	case mayraPoint >= 400:
		return models.PlatinumTier
	default:
		return ""
	}
}

func getOneBuyer(db *gorm.DB, buyerId string, buyerModel *models.Buyer, selector string) error {
	return db.Model(&models.Buyer{}).Preload("Wishlist.Prices").Preload("Wishlist").Preload("OrderHistory").
		Where(&models.Buyer{Id: buyerId}).
		Select(selector).
		First(&buyerModel).Error
}

func GetBuyer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	vars := mux.Vars(r)
	buyerId := vars["buyerId"]

	buyer := models.Buyer{}

	if err := getOneBuyer(database.DatabaseInstance.Gorm, buyerId, &buyer, "*"); err != nil {
		err_string := err.Error()
		var statusCode int = http.StatusInternalServerError
		if strings.Contains(err_string, "not found") {
			statusCode = http.StatusBadRequest
			err_string = fmt.Sprintf("buyer Id: %s might not exist. %s", buyerId, err_string)
		}
		middleware.HandleErrorResponse(w, statusCode, err_string)
		return
	}
	response := []models.Metadata{}

	getMediaFilesAndUpdateResponsePayload(w, buyer.Wishlist, &response)

	buyer.Wishlist = helpers.MapFunc(buyer.Wishlist, func(item models.JewelryItemInfo, _ int) models.JewelryItemInfo {
		metadata, ok := helpers.FindFunc(response, func(resItem models.Metadata, _ int) bool {
			return resItem.DirectoryId == item.DirectoryId
		})
		if ok {
			pointer := *metadata
			item.Media = append(item.Media, pointer.Media...)
			return item
		} else {
			return models.JewelryItemInfo{}
		}
	})

	middleware.HandleResponse(w, buyer)
}

func GetBuyerWishlist(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	vars := mux.Vars(r)

	buyerId := vars["buyerId"]

	buyer := models.Buyer{}
	if err := getOneBuyer(database.DatabaseInstance.Gorm, buyerId, &buyer, "id"); err != nil {
		err_string := err.Error()
		var statusCode int = http.StatusInternalServerError
		if strings.Contains(err_string, "not found") {
			statusCode = http.StatusBadRequest
			err_string = fmt.Sprintf("buyer Id: %s might not exist. %s", buyerId, err_string)
		}
		middleware.HandleErrorResponse(w, statusCode, err_string)
		return
	}

	response := []models.Metadata{}

	getMediaFilesAndUpdateResponsePayload(w, buyer.Wishlist, &response)

	buyer.Wishlist = helpers.MapFunc(buyer.Wishlist, func(item models.JewelryItemInfo, _ int) models.JewelryItemInfo {
		metadata, ok := helpers.FindFunc(response, func(resItem models.Metadata, _ int) bool {
			return resItem.DirectoryId == item.DirectoryId
		})
		if ok {
			pointer := *metadata
			item.Media = append(item.Media, pointer.Media...)
			return item
		} else {
			return models.JewelryItemInfo{}
		}
	})

	middleware.HandleResponse(w, buyer.Wishlist)
}

func UpsertBuyerDetails(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	if parse_err := r.ParseMultipartForm(10 << 20); parse_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, parse_err.Error())
		return
	}

	data := r.MultipartForm.Value

	if len(data) == 0 {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is empty")
		return
	}

	// Buyer Id check
	if data["id"] == nil && data["id"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is missing user's ID")
		return
	}
	buyerId := data["id"][0]

	// Jewelry Item check
	jewelryItems := []models.JewelryItemInfo{}
	if data["jewelryIds"] != nil && data["jewelryIds"][0] != "" {
		helpers.CastStringToAnyType(data["jewelryIds"][0], &jewelryItems)
		if err := database.DatabaseInstance.Gorm.
			Preload("Prices").Model([]models.JewelryItemInfo{}).
			Where(helpers.MapFunc(jewelryItems, func(__item models.JewelryItemInfo, _ int) models.JewelryItemInfo {
				return models.JewelryItemInfo{DirectoryId: __item.DirectoryId}
			})).
			First(&jewelryItems).Error; err != nil {
			middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Cannot get the jewelry info data: %s", err.Error()))
			return
		}
	}

	var buyer models.Buyer
	var tier models.Tier = ""
	if data["tier"] != nil {
		helpers.CastStringToAnyType(data["tier"][0], &tier)
	}

	var mayraPoint float64
	var conv_err error
	if data["mayraPoint"] != nil {
		mayraPoint, conv_err = strconv.ParseFloat(data["mayraPoint"][0], 32)
		if conv_err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, conv_err.Error())
			return
		}
	}

	if txn_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		if query_err := getOneBuyer(tx, buyerId, &buyer, "*"); query_err != nil {
			// If not found, create
			if strings.Contains(query_err.Error(), "not found") {
				buyer = models.Buyer{
					Id:           data["id"][0],
					OrderHistory: []models.Order{},
					Tier:         helpers.FalsyFallback(tier, models.SilverTier),
					MayraPoint:   helpers.FalsyFallback(float32(mayraPoint), 0),
				}
				// Add a new user
				if create_err := tx.Model(models.Buyer{}).
					Clauses(clause.OnConflict{
						Columns: []clause.Column{
							{Name: "id"},
						},
						UpdateAll: true,
					}).
					Create(buyer).Error; create_err != nil {
					return create_err
				}
				// Add a wishlist
				return tx.Model(&buyer).Association("Wishlist").Append(jewelryItems)
			}
			return query_err
		}

		// Otherwise, if found
		updatedData := map[string]interface{}{}
		var selectedKeys []string
		for key, value := range data {
			if data["jewelryIds"] != nil && data["jewelryIds"][0] != "" {
				continue
			}
			selectedKeys = append(selectedKeys, key)
			updatedData[key] = value[0]
		}
		if update_err := tx.Model(&models.Buyer{}).
			Where(&models.Buyer{Id: buyerId}).
			Select(selectedKeys).
			Updates(updatedData).Error; update_err != nil {
			return update_err
		}
		buyer := models.Buyer{}
		// Add a wishlist
		return tx.Model(&buyer).Where(&models.Buyer{Id: buyerId}).First(&buyer).Association("Wishlist").Append(jewelryItems)
	}); txn_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, txn_err.Error())
		return
	}
	middleware.HandleResponse(w, nil)
}

func sendEmail(buyerName string, lastFourDigits string, productName string, amount string, encryptedId []byte) error {
	confirmUrl := fmt.Sprintf("%s/admin/approval/%s", os.Getenv("FRONTEND_URL"), encryptedId)
	payload := fmt.Sprintf(`{
		"from": "Payments <onboarding@resend.dev>",
		"to": ["%s"],
		"subject": "Confirm payment for %s from %s with their last 4 digits on their account as %s - %s",
		"html": "<p><a href='%s'>Confirm here</a></p>"
	}`, productName, buyerName, lastFourDigits, os.Getenv("MERCHANT_EMAIL"), amount, confirmUrl)

	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", strings.NewReader(payload))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("RESEND_API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	_, err := http.DefaultClient.Do(req)
	return err
}

func ConfirmPaymentAndVerifyingOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	r.ParseMultipartForm(10 << 20)

	data := r.MultipartForm.Value

	// check for buyer ID
	if data["buyerId"] == nil || data["buyerId"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerId is missing from the payload")
		return
	}

	if data["buyerName"] == nil || data["buyerName"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerName is missing from the payload")
		return
	}

	if data["digits"] == nil || data["digits"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "digits is missing from the payload")
		return
	}

	if data["jewelryItems"] == nil || data["jewelryItems"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "jewelryItems is missing from the payload")
		return
	}

	// Prevent abusing the endpoint for confirming payments (5 seconds)
	if session_err := session.UserSessionFactory.AddSession(data["buyerId"][0]); session_err != nil {
		middleware.HandleErrorResponse(w, http.StatusForbidden, session_err.Error())
		return
	}

	jewelryItems := []models.JewelryItemInfo{}
	if cast_err := helpers.CastStringToAnyType(data["jewelryItems"][0], &jewelryItems); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
		return
	}

	var mayraPoint float32
	for _, item := range jewelryItems {
		for _, price := range item.Prices {
			afterDiscount := float32(price.Amount) * (1 - helpers.FalsyFallback(price.Discount, 0))
			mayraPoint += afterDiscount / 10000
		}
	}

	response := models.Order{
		JewelryItems: jewelryItems,
		Status:       models.PendingVerification,
		// PendingAt has a default value to now() so no need to fill it in the struct
		BuyerId: data["buyerId"][0],
	}

	if tx_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		// Update Order database table
		if jewelry_db_err := tx.Preload("JewelryItems").Model(&models.Order{}).Create(&response).Error; jewelry_db_err != nil {
			return jewelry_db_err
		}

		buyerOrderHistory := models.Buyer{}
		// Update Buyer database table
		if get_error := getOneBuyer(tx, data["buyerId"][0], &buyerOrderHistory, "orderHistory"); get_error != nil {
			return get_error
		}
		log.Printf("buyerOrderHistory from getOneBuyer() is %+v", buyerOrderHistory)
		buyerOrderHistory.OrderHistory = append(buyerOrderHistory.OrderHistory, response)
		return tx.Model(&models.Buyer{}).Select([]string{"orderHistory", "tier", "mayraPoint"}).Updates(map[string]interface{}{
			"orderHistory": buyerOrderHistory.OrderHistory,
			"tier":         convertMayraPointToTier(mayraPoint),
			"mayraPoint":   mayraPoint,
		}).Error
	}); tx_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, tx_err.Error())
		return
	}

	productNames := helpers.MapFunc(jewelryItems, func(item models.JewelryItemInfo, nil int) string {
		return item.ItemName
	})
	producePrices := helpers.MapFunc(jewelryItems, func(item models.JewelryItemInfo, nil int) string {
		amount := strconv.Itoa(int(item.Prices[0].Amount))
		return fmt.Sprintf("%s₫", amount)
	})

	// Create an encryption session ID to send an email to an admin
	buyerName := data["buyerName"][0]
	lastFourDigits := data["digits"][0]
	encryptedId, nonce, encryption_err := helpers.Encrypt([]byte(fmt.Sprintf("%s_%s", buyerName, lastFourDigits)), helpers.GenerateKey())
	if encryption_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, encryption_err.Error())
		return
	}
	if add_nonce_err := session.UserSessionFactory.AddNonceId(data["buyerId"][0], nonce); add_nonce_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, add_nonce_err.Error())
		return
	}
	sendEmail(buyerName, lastFourDigits, strings.Join(productNames, ", "), strings.Join(producePrices, ", "), encryptedId)

	middleware.HandleResponse(w, nil)
}
