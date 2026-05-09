package admin_cms

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/admin_auth"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/cloudflare"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

const maxUploadBytes = 25 << 20

func adminID(r *http.Request) string {
	claims, ok := admin_auth.AdminFromContext(r.Context())
	if !ok || claims == nil {
		return ""
	}
	return claims.Subject
}

type adminMetadata struct {
	models.Metadata
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

func hydrateMedia(item *models.JewelryItemInfo) error {
	bucketName := cloudflare.CloudflareInstance.BucketName
	objects, err := cloudflare.CloudflareInstance.ListObjectsInBucket(bucketName, &item.DirectoryId)
	if err != nil {
		return err
	}
	item.Media = item.Media[:0]
	for _, obj := range objects {
		publicURL, err := cloudflare.CloudflareInstance.BuildPublicUrl(*obj.Key)
		if err != nil {
			return err
		}
		item.Media = append(item.Media, models.MediaLink{URL: publicURL, FileName: *obj.Key})
	}
	return nil
}

func toMetadata(item models.JewelryItemInfo) models.Metadata {
	return models.Metadata{
		DirectoryId:       item.DirectoryId,
		ItemName:          item.ItemName,
		Description:       item.Description,
		Purchases:         item.Purchases,
		FeatureCollection: item.FeatureCollection,
		BestSeller:        item.BestSeller,
		Type:              item.Type,
		ViewCount:         item.ViewCount,
		Currency:          item.Currency,
		InStock:           item.InStock,
		Giftable:          item.Giftable,
		Translations:      item.Translations,
		Prices:            item.Prices,
		Media:             item.Media,
	}
}

func ListJewelry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	items := []models.JewelryItemInfo{}
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Preload("Prices").
		Order("\"itemName\" ASC").
		Find(&items).Error; err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := make([]models.Metadata, 0, len(items))
	for i := range items {
		if err := hydrateMedia(&items[i]); err != nil {
			middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
		response = append(response, toMetadata(items[i]))
	}
	middleware.HandleResponse(w, response)
}

func GetJewelry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	directoryId := mux.Vars(r)["directoryId"]
	if directoryId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId is required")
		return
	}
	item := models.JewelryItemInfo{}
	if err := database.DatabaseInstance.Gorm.WithContext(r.Context()).
		Preload("Prices").
		Where(&models.JewelryItemInfo{DirectoryId: directoryId}).
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			middleware.HandleErrorResponse(w, http.StatusNotFound, "jewelry not found")
			return
		}
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := hydrateMedia(&item); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	middleware.HandleResponse(w, toMetadata(item))
}

type updateJewelryRequest struct {
	ItemName          *string                     `json:"itemName,omitempty"`
	Description       *string                     `json:"description,omitempty"`
	FeatureCollection *string                     `json:"featureCollection,omitempty"`
	Giftable          *bool                       `json:"giftable,omitempty"`
	BestSeller        *bool                       `json:"bestSeller,omitempty"`
	Translations      *models.JewelryTranslations `json:"translations,omitempty"`
	Prices            *[]models.JewelryPrice      `json:"prices,omitempty"`
}

func UpdateJewelry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	directoryId := mux.Vars(r)["directoryId"]
	if directoryId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId is required")
		return
	}

	defer r.Body.Close()
	var req updateJewelryRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updates := map[string]any{}
	if req.ItemName != nil {
		if *req.ItemName == "" {
			middleware.HandleErrorResponse(w, http.StatusBadRequest, "itemName cannot be empty")
			return
		}
		updates["itemName"] = *req.ItemName
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.FeatureCollection != nil {
		updates["featureCollection"] = *req.FeatureCollection
	}
	if req.Giftable != nil {
		updates["giftable"] = *req.Giftable
	}
	if req.BestSeller != nil {
		updates["bestSeller"] = *req.BestSeller
	}
	if req.Translations != nil {
		updates["translations"] = *req.Translations
	}

	tx := database.DatabaseInstance.Gorm.WithContext(r.Context())
	if err := tx.Transaction(func(txn *gorm.DB) error {
		if len(updates) > 0 {
			if err := txn.Model(&models.JewelryItemInfo{}).
				Where(&models.JewelryItemInfo{DirectoryId: directoryId}).
				Updates(updates).Error; err != nil {
				return err
			}
		}
		if req.Prices != nil {
			for i := range *req.Prices {
				(*req.Prices)[i].JewelryItemInfoId = directoryId
			}
			if err := txn.Clauses(clause.OnConflict{
				Columns: []clause.Column{
					{Name: "jewelryItemInfoId"},
					{Name: "variation"},
				},
				UpdateAll: true,
			}).Create(req.Prices).Error; err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeAudit(r.Context(), adminID(r), "jewelry.update", directoryId, req)
	middleware.HandleResponse(w, nil)
}

type createJewelryResponse struct {
	DirectoryId string `json:"directoryId"`
}

func CreateJewelry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("could not parse multipart form: %v", err))
		return
	}
	data := r.MultipartForm.Value
	itemName := firstValue(data, "itemName")
	if itemName == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "itemName is required")
		return
	}
	pricesJSON := firstValue(data, "prices")
	if pricesJSON == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "prices is required")
		return
	}
	var prices []models.JewelryPrice
	if err := json.Unmarshal([]byte(pricesJSON), &prices); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("prices is not valid JSON: %v", err))
		return
	}
	if len(prices) == 0 {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "at least one price is required")
		return
	}

	jewelryType := models.JewelryType(firstValue(data, "type"))
	if jewelryType == "" {
		jewelryType = models.Ring
	}
	giftable := true
	if v := firstValue(data, "giftable"); v != "" {
		parsed, err := strconv.ParseBool(v)
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusBadRequest, "giftable must be a boolean")
			return
		}
		giftable = parsed
	}
	bestSeller := false
	if v := firstValue(data, "bestSeller"); v != "" {
		parsed, err := strconv.ParseBool(v)
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusBadRequest, "bestSeller must be a boolean")
			return
		}
		bestSeller = parsed
	}
	currency := firstValue(data, "currency")
	if currency == "" {
		currency = "VND"
	}

	directoryId := base64.StdEncoding.EncodeToString([]byte(itemName))

	var translations models.JewelryTranslations
	if raw := firstValue(data, "translations"); raw != "" {
		if err := json.Unmarshal([]byte(raw), &translations); err != nil {
			middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("translations is not valid JSON: %v", err))
			return
		}
	}

	tx := database.DatabaseInstance.Gorm.WithContext(r.Context())
	if err := tx.Transaction(func(txn *gorm.DB) error {
		item := &models.JewelryItemInfo{
			DirectoryId:       directoryId,
			ItemName:          itemName,
			Description:       firstValue(data, "description"),
			FeatureCollection: firstValue(data, "featureCollection"),
			Type:              jewelryType,
			Currency:          currency,
			InStock:           true,
			Giftable:          giftable,
			BestSeller:        bestSeller,
			Translations:      translations,
		}
		if err := txn.Save(item).Error; err != nil {
			return err
		}
		for i := range prices {
			prices[i].JewelryItemInfoId = directoryId
		}
		return txn.Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "jewelryItemInfoId"},
				{Name: "variation"},
			},
			UpdateAll: true,
		}).Create(&prices).Error
	}); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := uploadFormFiles(directoryId, r.MultipartForm.File); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeAudit(r.Context(), adminID(r), "jewelry.create", directoryId, map[string]any{
		"itemName": itemName,
		"prices":   prices,
	})
	middleware.HandleResponse(w, createJewelryResponse{DirectoryId: directoryId})
}

func UploadJewelryMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	directoryId := mux.Vars(r)["directoryId"]
	if directoryId == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId is required")
		return
	}
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("could not parse multipart form: %v", err))
		return
	}
	if err := uploadFormFiles(directoryId, r.MultipartForm.File); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uploaded := make([]string, 0, len(r.MultipartForm.File))
	for fieldName := range r.MultipartForm.File {
		uploaded = append(uploaded, fieldName)
	}
	writeAudit(r.Context(), adminID(r), "jewelry.media.upload", directoryId, map[string]any{"files": uploaded})
	middleware.HandleResponse(w, nil)
}

func DeleteJewelryMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		middleware.HandleErrorResponse(w, http.StatusMethodNotAllowed, "Wrong method")
		return
	}
	vars := mux.Vars(r)
	directoryId := vars["directoryId"]
	fileName := vars["fileName"]
	if directoryId == "" || fileName == "" {
		middleware.HandleErrorResponse(w, http.StatusBadRequest, "directoryId and fileName are required")
		return
	}
	key := fmt.Sprintf("%s/%s", directoryId, fileName)
	if err := cloudflare.CloudflareInstance.DeleteObject(cloudflare.CloudflareInstance.BucketName, key); err != nil {
		middleware.HandleErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeAudit(r.Context(), adminID(r), "jewelry.media.delete", directoryId, map[string]any{"fileName": fileName})
	middleware.HandleResponse(w, nil)
}

func uploadFormFiles(directoryId string, formFiles map[string][]*multipart.FileHeader) error {
	bucketName := cloudflare.CloudflareInstance.BucketName
	for fieldName, headers := range formFiles {
		for _, header := range headers {
			contentType := header.Header.Get("Content-Type")
			file, err := header.Open()
			if err != nil {
				return err
			}
			url, err := cloudflare.CloudflareInstance.GetPresignedUrl(bucketName, cloudflare.PresignedUrlPayload{
				FileName:  fmt.Sprintf("%s/%s", directoryId, fieldName),
				FileType:  &contentType,
				Procedure: "PUT",
			})
			if err != nil {
				file.Close()
				return err
			}
			if err := putToR2(*url, file, header.Size, contentType); err != nil {
				file.Close()
				return err
			}
			file.Close()
		}
	}
	return nil
}

func putToR2(presignedUrl string, file multipart.File, size int64, contentType string) error {
	client := http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest(http.MethodPut, presignedUrl, file)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", contentType)
	req.ContentLength = size
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(res.Body)
		return fmt.Errorf("upload failed: %s - %s", res.Status, string(body))
	}
	return nil
}

func firstValue(values map[string][]string, key string) string {
	if vals, ok := values[key]; ok && len(vals) > 0 {
		return vals[0]
	}
	return ""
}
