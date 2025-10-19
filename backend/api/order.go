package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
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
	response := []*models.Order{}
	if err := database.DatabaseInstance.Gorm.Preload("JewelryItems.Prices").Model(&response).
		Where(&models.Order{BuyerId: buyerId}).
		Select("*").
		Find(&response).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	// get media files.. function only accepts metadata type, so use that as a placeholder for all the media
	for _, order := range response {
		metadata := []models.Metadata{}
		getMediaFilesAndUpdateResponsePayload(w, order.JewelryItems, &metadata)

		jewelryItems := []models.JewelryItemInfo{}
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
