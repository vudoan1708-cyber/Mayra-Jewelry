package api

import (
	"net/http"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

func GetJewelry(w http.ResponseWriter, r *http.Request) {
	middleware.HandleResponse(w, "Hello")
}
