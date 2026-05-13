package api

import (
	"io"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/payment"
)

// HandlePaymentWebhook is the generic ingress for provider-driven payment
// confirmations. The {provider} segment selects the registered Verifier; the
// raw body is handed verbatim to it for signature checks. Returns 501 when no
// verifier is registered so the route can ship as a stub.
func HandlePaymentWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	provider := mux.Vars(r)["provider"]
	verifier, exists := payment.Get(payment.Source(provider))
	if !exists {
		middleware.HandleErrorResponse(w, http.StatusNotImplemented, "no verifier registered for provider: "+provider)
		return
	}

	body, readErr := io.ReadAll(r.Body)
	if readErr != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, readErr.Error())
		return
	}
	defer r.Body.Close()

	confirmation, verifyErr := verifier.Verify(r.Context(), body)
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
