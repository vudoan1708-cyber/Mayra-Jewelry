package middleware

import (
	"encoding/json"
	"net/http"
)

func HandleResponse(w http.ResponseWriter, response any) {
	if response == nil {
		http.Error(w, "response object not provided", http.StatusBadRequest)
	}
	w.Header().Set("Content-Type", "application/json")

	if error := json.NewEncoder(w).Encode(response); error != nil {
		http.Error(w, error.Error(), http.StatusInternalServerError)
	}
}

type Error struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

func HandleErrorResponse(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Error{
		Status:  status,
		Message: msg,
	})
}
