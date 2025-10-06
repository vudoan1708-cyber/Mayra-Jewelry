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

	"github.com/gorilla/mux"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func getAllJewelryItemInfo() (*[]models.JewelryItemInfo, error) {
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
	jewelryItems, query_err := getAllJewelryItemInfo()
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
			DirectoryId:       item.DirectoryId,
			ItemName:          item.ItemName,
			Purchases:         item.Purchases,
			FeatureCollection: item.FeatureCollection,
			BestSeller:        item.BestSeller,
			Type:              item.Type,
			ViewCount:         item.ViewCount,
			Prices:            item.Prices,
			Media:             urls[item.DirectoryId],
		}
	}
	middleware.HandleResponse(w, response)
}

func GetJewelryItemInfoByDirectoryId(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	vars := mux.Vars(r)
	directoryId := vars["directoryId"]
	if directoryId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId not found in the requested URL but is required")
		return
	}

	response := models.JewelryItemInfo{}

	if err := database.DatabaseInstance.Gorm.Preload("Prices").Model(models.JewelryItemInfo{}).Where(models.JewelryItemInfo{DirectoryId: directoryId}).First(&response).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Cannot get the jewelry info data: %s", err.Error()))
		return
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

	jewelryType := models.JewelryType(data["type"][0])
	tx_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		jewelryInfo := &models.JewelryItemInfo{
			DirectoryId:       itemNameBase64,
			ItemName:          data["itemName"][0],
			Description:       data["description"][0],
			FeatureCollection: data["featureCollection"][0],
			BestSeller:        false,
			Type:              jewelryType,
			ViewCount:         0, // First time an item is added will have 0 view count
			Purchases:         0, // First time an item is added will have 0 purchase
		}
		if infoDb := tx.Save(jewelryInfo); infoDb.Error != nil {
			log.Printf("Error with saving jewelry info data to Supabase")
			return infoDb.Error
		}
		for i := range convertedPrices {
			convertedPrices[i].JewelryItemInfoId = jewelryInfo.DirectoryId
		}
		if priceDb := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "jewelryItemInfoId"},
				{Name: "variation"},
			}, // key to check for conflict
			UpdateAll: true, // update all fields if conflict
		}).Create(convertedPrices); priceDb.Error != nil {
			log.Printf("Error with saving jewelry prices data to Supabase")
			return priceDb.Error
		}
		return nil
	})

	if tx_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, tx_err.Error())
		return
	}

	// File fields processed and uploaded to Cloudflare
	if upload_err := handleUploadFiles(itemNameBase64, r.MultipartForm.File); upload_err != nil {
		log.Printf("Error with handleUploadFiles()")
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, upload_err.Error())
		return
	}

	middleware.HandleResponse(w, nil)
}

func UpdateJewelryInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "method must be PATCH")
		return
	}

	// 10MB data
	if parse_err := r.ParseMultipartForm(10 << 20); parse_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Parsing error: %s", parse_err))
		return
	}

	data := r.MultipartForm.Value
	directoryId := data["directoryId"][0]

	if directoryId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId is not found in the request payload and is required")
		return
	}

	var selectedFields []string
	updatedData := map[string]interface{}{}
	for key, value := range data {
		selectedFields = append(selectedFields, key)
		updatedData[key] = value[0]
	}
	if transaction_err := database.DatabaseInstance.Gorm.Transaction(func(tx *gorm.DB) error {
		if update_err := tx.Model(&models.JewelryItemInfo{}).Where(&models.JewelryItemInfo{DirectoryId: directoryId}).Select(selectedFields).Updates(updatedData).Error; update_err != nil {
			return update_err
		}
		return nil
	}); transaction_err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Transaction failed: %s", transaction_err.Error()))
		return
	}
	middleware.HandleResponse(w, nil)
}
