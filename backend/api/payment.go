package api

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/vietqr"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

func GetBanks(w http.ResponseWriter, r *http.Request) {
	response, error := vietqr.VietQrInstance.GetBanks(nil)
	if error != nil {
		http.Error(w, error.Error(), http.StatusInternalServerError)
	}

	middleware.HandleResponse(w, response)
}

func GetQRCode(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	amount, conversion_error := strconv.Atoi(vars["amount"])
	if conversion_error != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, conversion_error.Error())
	}
	info := vars["info"]
	qrCode, qrCode_error := vietqr.VietQrInstance.GetQRCode(amount, &info)
	if qrCode_error != nil {
		http.Error(w, qrCode_error.Error(), http.StatusInternalServerError)
	}

	middleware.HandleResponse(w, qrCode)
}
