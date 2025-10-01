package api

import "net/http"

func GetJewelry(w http.ResponseWriter, r *http.Request) {
	println("Hello From Jewelry")
}
