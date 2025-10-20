package api

import (
	"encoding/base64"
	"encoding/json"
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
	nonDbModels "github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func convertMayraPointToTier(mayraPoint float32) models.Tier {
	switch {
	case mayraPoint < 100:
		return models.SilverTier
	case mayraPoint < 600:
		return models.GoldTier
	case mayraPoint >= 1200:
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

func AddToBuyerWishlist(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	r.ParseMultipartForm(10 << 20)

	data := r.MultipartForm.Value

	if len(data) == 0 {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is missing")
		return
	}
	if data["buyerId"] == nil || data["buyerId"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerId is missing from the payload")
		return
	}
	if data["wishlistItems"] == nil || data["wishlistItems"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "wishlistItems is missing from the payload")
		return
	}

	jewelryItems := []models.JewelryItemInfo{}
	if cast_err := helpers.CastStringToAnyType(data["wishlistItems"][0], &jewelryItems); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
		return
	}

	// Step 1: Get Jewelry items (including Prices and Media) from Directory IDs
	if get_err := database.DatabaseInstance.Gorm.Model(&jewelryItems).
		Where(helpers.MapFunc(jewelryItems, func(item models.JewelryItemInfo, _ int) models.JewelryItemInfo {
			return models.JewelryItemInfo{DirectoryId: item.DirectoryId}
		})).
		Find(&jewelryItems).Error; get_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, get_err.Error())
		return
	}

	// Step 2: Add those items to wishlist
	buyer := models.Buyer{}
	if get_buyer_err := database.DatabaseInstance.Gorm.Model(&buyer).Where(&models.Buyer{Id: data["buyerId"][0]}).First(&buyer).Error; get_buyer_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, get_buyer_err.Error())
		return
	}

	if update_err := database.DatabaseInstance.Gorm.Model(&buyer).Association("Wishlist").Append(jewelryItems); update_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, update_err.Error())
		return
	}
	log.Printf("After adding buyer: %+v", buyer)
	middleware.HandleResponse(w, buyer)
}

func CheckIfItemInWishlist(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	vars := mux.Vars(r)
	buyerId := vars["buyerId"]
	directoryId := vars["directoryId"]

	var missingFields []string
	if buyerId == "" {
		missingFields = append(missingFields, "buyerId")
	}
	if directoryId == "" {
		missingFields = append(missingFields, "directoryId")
	}

	if len(missingFields) > 0 {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("%s field(s) missing from payload", strings.Join(missingFields, ", ")))
		return
	}

	response := map[string]any{}
	if get_err := database.DatabaseInstance.Gorm.Table("buyer_wishlists").
		Where("\"buyer_id\" = ?", buyerId).
		Where("\"jewelry_id\" = ?", directoryId).
		Limit(1).
		Scan(&response).Error; get_err != nil {
		err_string := get_err.Error()
		if strings.Contains(err_string, "not found") {
			log.Printf("Cannot get a row from buyer_wishlists table. Possibly due to no record for the given parameters found. Reason: %s", err_string)
			middleware.HandleResponse(w, map[string]any{
				"found": false,
			})
			return
		}
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err_string)
		return
	}
	if len(response) == 0 {
		middleware.HandleResponse(w, map[string]any{
			"found": false,
		})
		return
	}
	middleware.HandleResponse(w, map[string]any{
		"found": true,
	})
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
	if data["id"] == nil || data["id"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is missing user's ID")
		return
	}
	buyerId := data["id"][0]

	// Jewelry Item check
	jewelryItems := []models.JewelryItemInfo{}
	if data["wishlistItems"] == nil || data["wishlistItems"][0] == "" {
		log.Printf("Payload is missing wishlistItems but is non-critical")
	} else {
		if cast_err := helpers.CastStringToAnyType(data["wishlistItems"][0], &jewelryItems); cast_err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
			return
		}
	}

	// If data is passed through and is valid
	if len(jewelryItems) > 0 {
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

	if txn_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		if query_err := getOneBuyer(tx, buyerId, &buyer, "*"); query_err != nil {
			// If not found, create
			if strings.Contains(query_err.Error(), "not found") {
				if create_err := createNewUser(tx, &buyer, data); create_err != nil {
					return create_err
				}

				// Add a wishlist
				if len(jewelryItems) > 0 {
					return tx.Model(&buyer).Association("Wishlist").Append(jewelryItems)
				}
			}
			return query_err
		}

		// Otherwise, if found
		updatedData := map[string]any{}
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
	encoded := base64.URLEncoding.EncodeToString(encryptedId)
	confirmUrl := fmt.Sprintf("%s/admin/approval/%s", os.Getenv("FRONTEND_URL"), encoded)
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	params := &resend.SendEmailRequest{
		From:    "Mayra Payments <onboarding@resend.dev>",
		To:      []string{os.Getenv("MERCHANT_EMAIL")},
		Subject: fmt.Sprintf("Confirm payment for %s from %s", productName, buyerName),
		Html: fmt.Sprintf(
			`<div>
				<span>Buyer named: <strong>%s</strong>, with the last 5 digits on their account as <strong>%s</strong> spent <strong>%s</strong> to buy <strong>%s</strong></span><br />
				<a href='%s'>Confirm here</a>
			</div>`,
			buyerName, lastFourDigits, amount, productName, confirmUrl,
		),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	fmt.Println("sent.Id", sent.Id)
	return nil
}

func RequestVerifyingOrder(w http.ResponseWriter, r *http.Request) {
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
	buyerId := data["buyerId"][0]

	if data["buyerName"] == nil || data["buyerName"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerName is missing from the payload")
		return
	}
	if data["buyerEmail"] == nil || data["buyerEmail"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerEmail is missing from the payload")
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

	if data["totalAmount"] == nil || data["totalAmount"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "totalAmount is missing from the payload")
		return
	}

	// Prevent abusing the endpoint for confirming payments (5 seconds)
	if session_err := session.UserSessionFactory.AddSession(buyerId); session_err != nil {
		middleware.HandleErrorResponse(w, http.StatusForbidden, session_err.Error())
		return
	}

	jewelryItems := []models.JewelryItemInfo{}
	if cast_err := helpers.CastStringToAnyType(data["jewelryItems"][0], &jewelryItems); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
		return
	}

	directoryIds := helpers.MapFunc(jewelryItems, func(__item models.JewelryItemInfo, _ int) string {
		return __item.DirectoryId
	})
	if get_many_jewelry_err := database.DatabaseInstance.Gorm.
		Preload("Prices").Model([]models.JewelryItemInfo{}).
		Where("\"directoryId\" IN ?", directoryIds).
		Find(&jewelryItems).Error; get_many_jewelry_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, get_many_jewelry_err.Error())
		return
	}

	// PendingAt has a default value to now() so no need to fill it in the struct
	orderPayload := models.Order{
		Status:  models.PendingVerification,
		BuyerId: buyerId,
	}

	if tx_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		buyer := models.Buyer{}
		// Get a buyer with a provided ID
		if get_error := getOneBuyer(tx, buyerId, &buyer, "*"); get_error != nil {
			log.Printf("Cannot get the buyer with ID: %s. Reason: %s", buyerId, get_error.Error())
			// If error, it's likely that the user doesn't exist
			if strings.Contains(get_error.Error(), "not found") {
				if create_err := createNewUser(tx, &buyer, data); create_err != nil {
					return fmt.Errorf("error when trying to create a new user after a passed in user ID not being found. Reason: %s", create_err.Error())
				}
			} else {
				return get_error
			}
		}
		// Create an Order with a pending state
		if jewelry_db_err := tx.Model(&models.Order{}).Create(&orderPayload).Error; jewelry_db_err != nil {
			return jewelry_db_err
		}
		if association_err := tx.Model(&orderPayload).Association("JewelryItems").Append(jewelryItems); association_err != nil {
			return association_err
		}

		// Sending Notification to an admin
		productNames := helpers.MapFunc(jewelryItems, func(item models.JewelryItemInfo, nil int) string {
			return item.ItemName
		})

		// Create an encryption session ID to send an email to an admin
		buyerName := data["buyerName"][0]
		lastFourDigits := data["digits"][0]
		jsonData, serialize_err := json.Marshal(nonDbModels.EncryptionData{
			BuyerId:     buyerId,
			BuyerEmail:  data["buyerEmail"][0],
			OrderId:     orderPayload.Id,
			TotalAmount: data["totalAmount"][0],
		})
		if serialize_err != nil {
			return serialize_err
		}
		cypherKey := helpers.GenerateKey()
		encryptedId, nonce, encryption_err := helpers.Encrypt(fmt.Appendf(nil, "%s", jsonData), cypherKey)
		if encryption_err != nil {
			return encryption_err
		}
		if add_nonce_err := session.UserSessionFactory.AddNonceAndKey(buyerId, nonce, cypherKey, encryptedId); add_nonce_err != nil {
			return add_nonce_err
		}
		return sendEmail(buyerName, lastFourDigits, strings.Join(productNames, ", "), fmt.Sprintf("%s₫", data["totalAmount"][0]), encryptedId)
	}); tx_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, tx_err.Error())
		return
	}

	middleware.HandleResponse(w, nil)
}
