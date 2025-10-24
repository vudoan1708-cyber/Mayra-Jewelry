package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"gorm.io/gorm/clause"
)

func GetOrdersByBuyerId(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	vars := mux.Vars(r)
	buyerId := vars["buyerId"]

	if buyerId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "buyerId is missing from the payload")
		return
	}

	// Step 1: Get order(s) from a buyer via the buyerId
	response := []*models.Order{}
	if err := database.DatabaseInstance.Gorm.Preload("OrderJewelryItems").Model(&response).
		Where(&models.Order{BuyerId: buyerId}).
		Select("*").
		Order(clause.OrderByColumn{Column: clause.Column{Name: "verifiedAt"}, Desc: true}).
		Find(&response).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	// get media files.. function only accepts metadata type, so use that as a placeholder for all the media
	for _, order := range response {
		// Step 2: Get the joined table (Order and Jewelry Ids) to obtain JewelryIds
		jewelryIds := helpers.MapFunc(order.OrderJewelryItems, func(item models.OrderJewelryItem, _ int) string {
			return item.JewelryId
		})
		// Step 3: Use obtained jewelryIds to get jewelryItems
		jewelryItems := []models.JewelryItemInfo{}
		if get_jewelry_err := database.DatabaseInstance.Gorm.Model(&jewelryItems).
			Where("\"directoryId\" IN ?", jewelryIds).
			Find(&jewelryItems).Error; get_jewelry_err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, get_jewelry_err.Error())
			return
		}
		metadata := []models.Metadata{}
		getMediaFilesAndUpdateResponsePayload(w, jewelryItems, &metadata)

		bytes, marshal_err := json.Marshal(metadata)
		if marshal_err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, marshal_err.Error())
			return
		}
		if cast_err := helpers.CastStringToAnyType(string(bytes), &jewelryItems); cast_err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, cast_err.Error())
			return
		}
		order.JewelryItems = jewelryItems
	}

	middleware.HandleResponse(w, &response)
}
