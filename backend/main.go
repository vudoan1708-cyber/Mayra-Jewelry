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
	"github.com/joho/godotenv"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/admin_auth"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/admin_cms"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/site"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
)

func main() {
	port := 8080

	env_err := godotenv.Load()
	if env_err != nil {
		log.Fatal(env_err)
	}
	allowedOrigin := os.Getenv("FRONTEND_URL")

	cloudflare.CloudflareInstance.Init()
	_, init_err := database.DatabaseInstance.Init()
	if init_err != nil {
		log.Fatal("Cannot initialise database")
	}
	if migration_err := database.DatabaseInstance.AutoMigrate(); migration_err != nil {
		log.Fatal("Cannot auto-migrate database")
	}
	if backfill_err := database.DatabaseInstance.BackfillJewelryTranslations(); backfill_err != nil {
		log.Printf("warning: legacy translation backfill failed: %v", backfill_err)
	}

	r := mux.NewRouter()

	// CORS for HTTP request polling
	cors := handlers.CORS(
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"}),
		handlers.AllowedOrigins([]string{allowedOrigin}),
	)

	var address string = "0.0.0.0" + ":" + strconv.Itoa(port)

	apiRouter := r.PathPrefix("/api").Subrouter()

	adminAuthRouter := apiRouter.PathPrefix("/admin").Subrouter()
	adminAuthRouter.Handle("/login", admin_auth.RateLimitLogin(http.HandlerFunc(admin_auth.Login))).Methods("POST")
	adminAuthRouter.Handle("/login/totp", admin_auth.RateLimitLogin(http.HandlerFunc(admin_auth.VerifyTotp))).Methods("POST")

	adminProtectedRouter := apiRouter.PathPrefix("/admin").Subrouter()
	adminProtectedRouter.Use(admin_auth.RequireAdmin)
	adminProtectedRouter.HandleFunc("/whoami", admin_auth.Whoami).Methods("GET")
	adminProtectedRouter.HandleFunc("/jewelry", admin_cms.ListJewelry).Methods("GET")
	adminProtectedRouter.HandleFunc("/jewelry", admin_cms.CreateJewelry).Methods("POST")
	adminProtectedRouter.HandleFunc("/jewelry/{directoryId}", admin_cms.GetJewelry).Methods("GET")
	adminProtectedRouter.HandleFunc("/jewelry/{directoryId}", admin_cms.UpdateJewelry).Methods("PATCH")
	adminProtectedRouter.HandleFunc("/jewelry/{directoryId}/media", admin_cms.UploadJewelryMedia).Methods("POST")
	adminProtectedRouter.HandleFunc("/jewelry/{directoryId}/media/{fileName}", admin_cms.DeleteJewelryMedia).Methods("DELETE")
	adminProtectedRouter.HandleFunc("/site/banner", admin_cms.UpdateBanner).Methods("PATCH")
	adminProtectedRouter.HandleFunc("/users", admin_cms.ListAdmins).Methods("GET")
	adminProtectedRouter.HandleFunc("/users", admin_cms.CreateAdmin).Methods("POST")
	adminProtectedRouter.HandleFunc("/users/{id}", admin_cms.UpdateAdmin).Methods("PATCH")

	apiRouter.HandleFunc("/site/banner", site.GetBanner).Methods("GET")
	apiRouter.HandleFunc("/jewelry/collection/best", api.GetJewelryItemsByBestSeller).Methods("GET")
	apiRouter.HandleFunc("/jewelry/collection/feature", api.GetUniqueFeatureCollections).Methods("GET")
	apiRouter.HandleFunc("/jewelry/collection/{collectionName}", api.GetJewelryItemsByCollectionName).Methods("GET")
	apiRouter.HandleFunc("/jewelry/{directoryId}/collection/most-views", api.GetJewelryMostViews).Methods("GET")
	apiRouter.HandleFunc("/jewelry/{directoryId}", api.GetJewelryItemInfoByDirectoryId).Methods("GET")
	apiRouter.HandleFunc("/jewelry", api.GetJewelryItems).Methods("GET")
	apiRouter.HandleFunc("/jewelry", api.AddJewelryItem).Methods("POST")
	apiRouter.HandleFunc("/jewelry", api.UpdateJewelryInfo).Methods("PATCH")
	apiRouter.HandleFunc("/user/buyer/{buyerId}", api.GetBuyer).Methods("GET")
	apiRouter.HandleFunc("/user/buyer/payment/pending-verification", api.RequestVerifyingOrder).Methods("POST")
	apiRouter.HandleFunc("/user/buyer", api.UpsertBuyerDetails).Methods("POST")
	apiRouter.HandleFunc("/order/buyer/{buyerId}", api.GetOrdersByBuyerId).Methods("GET")
	apiRouter.HandleFunc("/payment/confirm-payment", api.ConfirmPaymentAndVerifyOrder).Methods("POST")
	apiRouter.HandleFunc("/payment/banks", api.GetBanks).Methods("GET")
	apiRouter.HandleFunc("/payment/qr", api.GetQRCode).Methods("GET")

	srv := &http.Server{
		Handler: handlers.CombinedLoggingHandler(os.Stdout, cors(apiRouter)),
		Addr:    address,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout:   15 * time.Second,
		ReadTimeout:    15 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	fmt.Printf("✅ App is running at http://%s\n", address)

	err := srv.ListenAndServe()

	if err != nil {
		log.Fatal("Server exited with error:", err)
	}
}
