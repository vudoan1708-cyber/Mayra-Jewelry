package api

import (
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

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
	var mediaLinks []models.MediaLink
	var currentDir string
	for idx, obj := range objects {
		url, err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
			FileName:  *obj.Key,
			Procedure: "GET",
		})
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Cannot get presigned url for bucket: %s. Reason: %s", *obj.Key, err.Error()))
			log.Fatal(err)
			return
		}

		// No nested directories so only need to split the path string and grab the first part
		parts := strings.Split(*obj.Key, "/")
		var newDirectoryFound bool = currentDir != parts[0]
		if newDirectoryFound {
			tempDir := parts[0]
			urls[currentDir] = append(urls[helpers.FalsyFallback(currentDir, tempDir)], mediaLinks...)

			mediaLinks = []models.MediaLink{}
			currentDir = tempDir
			log.Printf("ℹ️  Directory found: %s", currentDir)
			log.Printf("ℹ️  %s directory contains %d images", currentDir, len(urls[currentDir]))
		}

		mediaLinks = append(mediaLinks, models.MediaLink{
			URL:      *url,
			FileName: *obj.Key,
		})

		if idx == len(objects)-1 {
			urls[currentDir] = append(urls[currentDir], mediaLinks...)
			mediaLinks = []models.MediaLink{}
		}
	}

	response := models.AllJewelryItemsResponsePayload{}
	for _, item := range *jewelryItems {
		var key string = fmt.Sprintf("%s/", item.DirectoryId)
		response[key] = models.Metadata{
			DirectoryId: item.DirectoryId,
			ItemName:    item.ItemName,
			Purchases:   item.Purchases,
			Prices:      item.Prices,
			Media:       urls[item.DirectoryId],
		}
	}
	middleware.HandleResponse(w, response)
}

func uploadFiles(presignedUrl string, file multipart.File, fileSize int64, contentType string) error {
	configClient := http.Client{
		Timeout: 15 * time.Second,
	}
	request, err := http.NewRequest(http.MethodPut, presignedUrl, file)
	if err != nil {
		return err
	}

	request.Header.Set("Content-Type", contentType)
	request.ContentLength = fileSize
	response, response_error := configClient.Do(request)
	if response_error != nil {
		return response_error
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(response.Body)
		return fmt.Errorf("upload failed: %s - %s", response.Status, string(body))
	}
	return nil
}
func handleUploadFiles(directory string, formFiles map[string][]*multipart.FileHeader) error {
	bucketName := cloudflare.CloudflareInstance.BucketName
	for fieldName, fieldFiles := range formFiles {
		// Alow multiple upload
		for _, fileHeader := range fieldFiles {
			contentType := fileHeader.Header.Get("Content-Type")
			file, err := fileHeader.Open()
			if err != nil {
				log.Printf("Error with processing file with fieldName: %s", fieldName)
				return err
			}

			defer file.Close()

			url, url_err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
				FileName:  fmt.Sprintf("%s/%s", directory, fieldName),
				FileType:  &contentType,
				Procedure: "PUT",
			})
			if url_err != nil {
				return url_err
			}

			if upload_err := uploadFiles(*url, file, fileHeader.Size, contentType); upload_err != nil {
				return upload_err
			}
		}
	}
	return nil
}
func AddJewelryItem(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}

	defer r.Body.Close()

	// Parse multipart form, limit 10MB
	if parse_err := r.ParseMultipartForm(10 << 20); parse_err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Unable to parse multipart form: %s", parse_err.Error()))
		return
	}

	// Normal form values processed and uploaded to Supabase
	data := r.MultipartForm.Value
	var convertedPrices []models.JewelryPrice
	if cast_err := helpers.CastStringToAnyType(data["prices"][0], &convertedPrices); cast_err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, cast_err.Error())
		return
	}

	itemNameBase64 := base64.StdEncoding.EncodeToString([]byte(data["itemName"][0]))
	jewelryInfo := &models.JewelryItemInfo{
		DirectoryId: itemNameBase64,
		ItemName:    data["itemName"][0],
		Description: data["description"][0],
		Purchases:   0, // First time an item is added will have 0 purchase
		Prices:      convertedPrices,
	}
	database.DatabaseInstance.Gorm.Save(jewelryInfo)

	// File fields processed and uploaded to Cloudflare
	if upload_err := handleUploadFiles(itemNameBase64, r.MultipartForm.File); upload_err != nil {
		log.Printf("Error with handleUploadFiles()")
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, upload_err.Error())
		return
	}

	middleware.HandleResponse(w, nil)
}
