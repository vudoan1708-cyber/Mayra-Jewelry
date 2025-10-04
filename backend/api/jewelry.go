package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

func getJewelryItemInfo() (*[]models.JewelryItemInfo, error) {
	jewelryInfo := []models.JewelryItemInfo{}
	if err := database.DatabaseInstance.Gorm.Preload("Prices").Find(&jewelryInfo).Error; err != nil {
		return nil, err
	}
	return &jewelryInfo, nil
}
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

	// Fetch all jewelry items from Supabase
	jewelryItems, query_err := getJewelryItemInfo()
	if query_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, query_err.Error())
		return
	}

	var urls = make(models.CloudflareJewelryItemPayload, 0)
	var metadata []models.ImageMetadata
	var currentDir string = ""
	for idx, obj := range objects {
		url, err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
			FileName:  *obj.Key,
			Procedure: "GET",
		})
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Cannot get presigned url for: %s", *obj.Key))
			log.Fatal(err)
			return
		}
		// Directories by ending slashes
		if strings.HasSuffix(*obj.Key, "/") {
			currentLink := helpers.FalsyFallback(currentDir, *obj.Key)
			urls[currentLink] = append(urls[currentLink], metadata...)
			metadata = []models.ImageMetadata{}
			currentDir = *obj.Key
			log.Printf("ℹ️  Directory found: %s", currentDir)
			log.Printf("ℹ️  %s directory contains %d images", currentDir, len(urls[currentLink]))
			continue
		}
		metadata = append(metadata, models.ImageMetadata{
			URL:      *url,
			FileName: *obj.Key,
		})

		if idx == len(objects)-1 {
			urls[currentDir] = append(urls[currentDir], metadata...)
			metadata = []models.ImageMetadata{}
		}
	}

	response := models.AllJewelryItemsResponsePayload{}
	for _, item := range *jewelryItems {
		mapped := helpers.MapFunc(urls[fmt.Sprintf("%s/", item.DirectoryId)], func(value models.ImageMetadata, nil int) models.Merged {
			mergedObject := models.Merged{
				ImageMetadata: models.ImageMetadata{
					URL:      value.URL,
					FileName: value.FileName,
				},
				JewelryItemInfo: models.JewelryItemInfo{
					Id:          item.Id,
					DirectoryId: item.DirectoryId,
					ItemName:    item.ItemName,
					Prices:      item.Prices,
				},
			}
			return mergedObject
		})
		response[fmt.Sprintf("%s/", item.DirectoryId)] = mapped
	}
	middleware.HandleResponse(w, response)
}

func AddJewelryItem(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	defer r.Body.Close()

	// Parse multipart form, limit 10MB
	// if parse_err := r.ParseMultipartForm(10 << 20); parse_err != nil {
	// 	middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Unable to parse multipart form: %s", parse_err.Error()))
	// 	return
	// }

	data, read_err := io.ReadAll(r.Body)
	if read_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, read_err.Error())
		return
	}

	jewelryInfo := &models.JewelryItemInfo{}
	if unmarshall_err := json.Unmarshal(data, &jewelryInfo); unmarshall_err != nil {
		log.Printf("Error with json.Unmarshal-ing JewelryItemInfo struct")
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, unmarshall_err.Error())
		return
	}

	database.DatabaseInstance.Create(jewelryInfo)
	middleware.HandleResponse(w, nil)
}
