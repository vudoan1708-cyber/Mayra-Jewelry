package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api"
)

func main() {
	port := 8080

	r := mux.NewRouter()

	// CORS for HTTP request polling
	cors := handlers.CORS(
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}),
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),
	)

	var address string = "0.0.0.0" + ":" + strconv.Itoa(port)

	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/jewelry", api.GetJewelry).Methods("GET")

	srv := &http.Server{
		Handler: handlers.CombinedLoggingHandler(os.Stdout, cors(apiRouter)),
		Addr:    address,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout:   15 * time.Second,
		ReadTimeout:    15 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	fmt.Printf("App is running at http://%s\n", address)

	err := srv.ListenAndServe()

	if err != nil {
		log.Fatal("Server exited with error:", err)
	}
}
