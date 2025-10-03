package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
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
