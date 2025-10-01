package main

import (
	"fmt"
	"log"
	"os"
	"time"
	"strconv"
	"net/http"
	// "encoding/json"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api"
)

func Test(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Test endpoint working HIIIII\n")
}

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

	srv := &http.Server{
		Handler: handlers.CombinedLoggingHandler(os.Stdout, cors(r)),
		Addr: address,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout:   15 * time.Second,
		ReadTimeout:    15 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	r.HandleFunc("/", Test).Methods("GET")
	
	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/api/jewelry", api.GetJewelry).Methods("GET")

	fmt.Printf("App is running at %s\n", address)

	err := srv.ListenAndServe()

	if err != nil {
		log.Fatal("Server exited with error:", err)
	}
}
