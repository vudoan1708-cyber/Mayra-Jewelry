package vietqr

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/models"
)

type VietQr struct {
	Bank      models.VietQRBankResponsePayload
	Template  string
	QRCodeUrl string
}

var baseUrl string = "https://api.vietqr.io/v2"

func (vietqr VietQr) GetBanks(specifiedBank *string) (*models.VietQRBankResponsePayload, error) {
	vietQrUrl := fmt.Sprintf("%s/banks", baseUrl)

	configClient := http.Client{
		Timeout: 15 * time.Second,
	}
	request, err := http.NewRequest(http.MethodGet, vietQrUrl, nil)

	if err != nil {
		return nil, err
	}

	response, response_error := configClient.Do(request)

	if response_error != nil {
		return nil, response_error
	}
	defer response.Body.Close()

	bytes, read_error := io.ReadAll(response.Body)

	if read_error != nil {
		return nil, read_error
	}

	bankData := models.VietQRBankResponsePayload{}
	if unmarshal_error := json.Unmarshal(bytes, &bankData); unmarshal_error != nil {
		return nil, unmarshal_error
	}

	return &bankData, nil
}

type QrRequestPayload struct {
	AccountNo   string  `json:"accountNo"`
	AccountName string  `json:"accountName"`
	Bin         int     `json:"acqId"`
	Amount      *int    `json:"amount"`
	AddInfo     *string `json:"addInfo"`
	Format      *string `json:"format"`
	Template    string  `json:"template"`
}

func (vietqr *VietQr) GetQRCode(amount int, addInfo *string) (*models.VietQRResponsePayload, error) {
	clientId := os.Getenv("VIETQR_CLIENT_ID")
	apiKey := os.Getenv("VIETQR_API_KEY")
	accountName := os.Getenv("VIETQR_ACCOUNT_NAME")
	accountNo := os.Getenv("VIETQR_ACCOUNT_NO")
	bin := os.Getenv("VIETQR_BIN")
	templateId := os.Getenv("VIETQR_TEMPLATE_ID")

	var missingItems []string
	if clientId == "" {
		missingItems = append(missingItems, "clientId")
	}
	if apiKey == "" {
		missingItems = append(missingItems, "apiKey")
	}
	if accountName == "" {
		missingItems = append(missingItems, "accountName")
	}
	if accountNo == "" {
		missingItems = append(missingItems, "accountNo")
	}
	if bin == "" {
		missingItems = append(missingItems, "bin")
	}
	if len(missingItems) > 0 {
		return nil, fmt.Errorf("missing field(s): %s", strings.Join(missingItems, ", "))
	}

	vietQrUrl := fmt.Sprintf("%s/generate", baseUrl)

	configClient := http.Client{
		Timeout: 15 * time.Second,
	}

	binNo, conversion_error := strconv.Atoi(bin)
	if conversion_error != nil {
		return nil, fmt.Errorf("cannot cast a stringified bin to a number: %s", conversion_error.Error())
	}
	reqPayload := QrRequestPayload{
		AccountNo:   accountNo,
		AccountName: accountName,
		Bin:         binNo,
		Amount:      &amount,
		AddInfo:     addInfo,
		Template:    templateId,
	}

	jsonPayload, marshal_error := json.Marshal(reqPayload)

	if marshal_error != nil {
		return nil, fmt.Errorf("cannot marshal request payload: %s", marshal_error.Error())
	}

	request, err := http.NewRequest(http.MethodPost, vietQrUrl, bytes.NewBuffer(jsonPayload))

	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-client-id", clientId)
	request.Header.Set("x-api-key", apiKey)

	response, response_error := configClient.Do(request)

	if response_error != nil {
		return nil, response_error
	}
	defer response.Body.Close()

	bytes, read_error := io.ReadAll(response.Body)

	if read_error != nil {
		return nil, read_error
	}

	vietQrResponse := models.VietQRResponsePayload{}
	if unmarshal_error := json.Unmarshal(bytes, &vietQrResponse); unmarshal_error != nil {
		return nil, unmarshal_error
	}

	return &vietQrResponse, nil
}

// Instantiate the class once internally
var VietQrInstance = &VietQr{}
