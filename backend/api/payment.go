package api

import (
	"net/http"
	"strconv"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/vietqr"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

func GetBanks(w http.ResponseWriter, r *http.Request) {
	response, error := vietqr.VietQrInstance.GetBanks(nil)
	if error != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, error.Error())
		return
	}

	middleware.HandleResponse(w, response)
}

func GetQRCode(w http.ResponseWriter, r *http.Request) {
	queryAmount := r.URL.Query().Get("amount")
	queryInfo := r.URL.Query().Get("info")
	if queryAmount == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "amount not found in the payload")
		return
	}
	amount, conversion_error := strconv.Atoi(queryAmount)
	if conversion_error != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, conversion_error.Error())
		return
	}
	if queryInfo == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "info not found in the payload")
		return
	}
	qrCode, qrCode_error := vietqr.VietQrInstance.GetQRCode(amount, &queryInfo)
	if qrCode_error != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, qrCode_error.Error())
		return
	}

	middleware.HandleResponse(w, qrCode)
}
