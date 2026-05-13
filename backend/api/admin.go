package api

import (
	"net/http"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/payment"
)

func ConfirmPaymentAndVerifyOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	if parseErr := r.ParseMultipartForm(10 << 20); parseErr != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, parseErr.Error())
		return
	}

	data := r.MultipartForm.Value
	if data["id"] == nil || data["id"][0] == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "id is missing from payload")
		return
	}

	verifier, exists := payment.Get(payment.SourceManualBank)
	if !exists {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, "manual bank verifier not registered")
		return
	}
	confirmation, verifyErr := verifier.Verify(r.Context(), []byte(data["id"][0]))
	if verifyErr != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, verifyErr.Error())
		return
	}
	if confirmErr := payment.ConfirmOrderPayment(r.Context(), confirmation); confirmErr != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, confirmErr.Error())
		return
	}
	middleware.HandleResponse(w, nil)
}
