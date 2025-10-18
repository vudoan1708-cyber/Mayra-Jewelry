package api

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/resend/resend-go/v2"

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

func createNewUser(tx *gorm.DB, buyer *models.Buyer, data map[string][]string) error {
	var tier models.Tier = ""
	if data["tier"] != nil && data["tier"][0] != "" {
		helpers.CastStringToAnyType(data["tier"][0], &tier)
	}

	var mayraPoint float64
	var conv_err error
	if data["mayraPoint"] != nil && data["mayraPoint"][0] != "" {
		mayraPoint, conv_err = strconv.ParseFloat(data["mayraPoint"][0], 32)
		if conv_err != nil {
			return conv_err
		}
	}
	*buyer = models.Buyer{
		Id:           data["id"][0],
		OrderHistory: []models.Order{},
		Tier:         helpers.FalsyFallback(tier, models.SilverTier),
		MayraPoint:   helpers.FalsyFallback(float32(mayraPoint), 0),
	}

	// Add a new user
	return tx.Model(models.Buyer{}).
		Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "id"},
			},
			UpdateAll: true,
		}).
		Create(&buyer).Error
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
	if data["wishlistItems"] == nil && data["wishlistItems"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is missing wishlistItems")
		return
	}
	if cast_err := helpers.CastStringToAnyType(data["wishlistItems"][0], &jewelryItems); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
		return
	}
	if err := database.DatabaseInstance.Gorm.
		Preload("Prices").Model([]models.JewelryItemInfo{}).
		Where(helpers.MapFunc(jewelryItems, func(__item models.JewelryItemInfo, _ int) models.JewelryItemInfo {
			return models.JewelryItemInfo{DirectoryId: __item.DirectoryId}
		})).
		First(&jewelryItems).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Cannot get the jewelry info data: %s", err.Error()))
		return
	}

	var buyer models.Buyer

	if txn_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		if query_err := getOneBuyer(tx, buyerId, &buyer, "*"); query_err != nil {
			// If not found, create
			if strings.Contains(query_err.Error(), "not found") {
				if create_err := createNewUser(tx, &buyer, data); create_err != nil {
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
			if key == "wishlistItems" {
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
	encoded := base64.StdEncoding.EncodeToString(encryptedId)
	log.Printf("encoded: %s", encoded)
	confirmUrl := fmt.Sprintf("%s/admin/approval/%s", os.Getenv("FRONTEND_URL"), encoded)
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	params := &resend.SendEmailRequest{
		From:    "Mayra Payments <onboarding@resend.dev>",
		To:      []string{os.Getenv("MERCHANT_EMAIL")},
		Subject: fmt.Sprintf("Confirm payment for %s product(s) from %s with their last 4 digits on their account as %s - %s", productName, buyerName, lastFourDigits, amount),
		Html:    fmt.Sprintf("<p><a href='%s'>Confirm here</a></p>", confirmUrl),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	fmt.Println("sent.Id", sent.Id)
	return nil
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
	data["id"] = data["buyerId"]

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

	// PendingAt has a default value to now() so no need to fill it in the struct
	orderPayload := models.Order{
		Status:  models.PendingVerification,
		BuyerId: data["buyerId"][0],
	}

	if tx_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		buyer := models.Buyer{}
		// Get a buyer with a provided ID
		if get_error := getOneBuyer(tx, data["buyerId"][0], &buyer, "*"); get_error != nil {
			log.Printf("Cannot get the buyer with ID: %s. Reason: %s", data["buyerId"][0], get_error.Error())
			// If error, it's likely that the user doesn't exist
			if strings.Contains(get_error.Error(), "not found") {
				if create_err := createNewUser(tx, &buyer, data); create_err != nil {
					return fmt.Errorf("error when trying to create a new user after a passed in user ID not being found. Reason: %s", create_err.Error())
				}
			} else {
				return get_error
			}
		}
		// Update Order database table
		if jewelry_db_err := tx.Model(&models.Order{}).Create(&orderPayload).Error; jewelry_db_err != nil {
			return jewelry_db_err
		}
		if association_err := tx.Model(&orderPayload).Association("JewelryItems").Append(jewelryItems); association_err != nil {
			return association_err
		}

		if update_err := tx.Model(&models.Buyer{}).
			Where(&models.Buyer{Id: data["buyerId"][0]}).
			Select([]string{"tier", "mayraPoint"}).
			Updates(map[string]any{
				"tier":       convertMayraPointToTier(mayraPoint),
				"mayraPoint": mayraPoint,
			}).Error; update_err != nil {
			return update_err
		}

		// Sending Notification to an admin
		if get_many_jewelry_err := GetManyJewelryItemInfoByDirectoryIds(tx, &jewelryItems); get_many_jewelry_err != nil {
			return get_many_jewelry_err
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
			return encryption_err
		}
		if add_nonce_err := session.UserSessionFactory.AddNonceId(data["buyerId"][0], nonce); add_nonce_err != nil {
			return add_nonce_err
		}
		return sendEmail(buyerName, lastFourDigits, strings.Join(productNames, ", "), strings.Join(producePrices, ", "), encryptedId)
	}); tx_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, tx_err.Error())
		return
	}

	middleware.HandleResponse(w, nil)
}
