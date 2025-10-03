package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/types"
)

func GetJewelryItems(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "wrong method", http.StatusMethodNotAllowed)
	}
	bucketName := cloudflare.CloudflareInstance.BucketName

	objects, err := cloudflare.CloudflareInstance.ListObjectsInBucket(bucketName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var urls []types.JewelryItemPayload
	for _, obj := range objects {
		url, err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
			FileName:  *obj.Key,
			Procedure: "GET",
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Cannot get presigned url for: %s", *obj.Key), http.StatusInternalServerError)
			log.Fatal(err)
		}
		urls = append(urls, types.JewelryItemPayload{
			URL:      *url,
			FileName: *obj.Key,
		})
	}
	middleware.HandleResponse(w, urls)
}
