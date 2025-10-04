package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	dbModel "github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/models"
)

func GetJewelryItems(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	bucketName := cloudflare.CloudflareInstance.BucketName

	objects, err := cloudflare.CloudflareInstance.ListObjectsInBucket(bucketName)
	if err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	var urls []models.JewelryItemPayload
	for _, obj := range objects {
		url, err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
			FileName:  *obj.Key,
			Procedure: "GET",
		})
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Cannot get presigned url for: %s", *obj.Key))
			log.Fatal(err)
			return
		}
		urls = append(urls, models.JewelryItemPayload{
			URL:      *url,
			FileName: *obj.Key,
		})
	}
	middleware.HandleResponse(w, urls)
}

func AddJewelryItem(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	defer r.Body.Close()

	data, read_err := io.ReadAll(r.Body)
	if read_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, read_err.Error())
		return
	}

	jewelryInfo := &dbModel.JewelryItemInfo{}
	if unmarshall_err := json.Unmarshal(data, &jewelryInfo); unmarshall_err != nil {
		log.Printf("Error with json.Unmarshal-ing JewelryItemInfo struct")
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, unmarshall_err.Error())
		return
	}

	database.DatabaseInstance.Create(jewelryInfo)
	middleware.HandleResponse(w, nil)
}
