package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func getOneBuyer(db *gorm.DB, buyerId string, buyerModel *models.Buyer, selector string) error {
	return db.Model(&models.Buyer{}).
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
	if err := getOneBuyer(database.DatabaseInstance.Gorm, buyerId, &buyer, "wishlist"); err != nil {
		err_string := err.Error()
		var statusCode int = http.StatusInternalServerError
		if strings.Contains(err_string, "not found") {
			statusCode = http.StatusBadRequest
			err_string = fmt.Sprintf("buyer Id: %s might not exist. %s", buyerId, err_string)
		}
		middleware.HandleErrorResponse(w, statusCode, err_string)
		return
	}

	middleware.HandleResponse(w, buyer)
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

	buyerId := data["id"][0]
	if buyerId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "Payload is missing user's ID")
		return
	}

	var buyer models.Buyer

	if txn_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		if query_err := getOneBuyer(tx, buyerId, &buyer, "*"); query_err != nil {
			// If not found, create
			if strings.Contains(query_err.Error(), "not found") {
				buyer = models.Buyer{
					Id:           data["id"][0],
					Wishlist:     []models.JewelryItemInfo{},
					OrderHistory: []models.Order{},
					Tier:         "Silver",
					MayraPoint:   0,
				}
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
				return nil
			}
			return query_err
		}

		// Otherwise, if found
		updatedData := map[string]interface{}{}
		var selectedKeys []string
		for key, value := range data {
			selectedKeys = append(selectedKeys, key)
			updatedData[key] = value[0]
		}
		return tx.Model(&models.Buyer{}).
			Where(&models.Buyer{Id: buyerId}).
			Select(selectedKeys).
			Updates(updatedData).Error
	}); txn_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, txn_err.Error())
		return
	}
	middleware.HandleResponse(w, nil)
}
