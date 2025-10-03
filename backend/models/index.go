package models

type JewelryItemPayload struct {
	URL      string `json:"url"`
	FileName string `json:"fileName"`
}

type VietQRCodeData struct {
	Bin         int    `json:"acpId"`
	AccountName string `json:"accountName"`
	QrCode      string `json:"qrCode"`
	QrDataUrl   string `json:"qrDataURL"`
}

type Bank struct {
	Id                int     `json:"id"`
	Name              string  `json:"name"`
	Code              string  `json:"code"`
	Bin               string  `json:"bin"`
	ShortName         string  `json:"shortName"`
	Logo              string  `json:"logo"`
	TransferSupported int     `json:"transferSupported"`
	LookupSupported   int     `json:"lookupSupported"`
	Short_Name        string  `json:"short_name"`
	Support           int     `json:"support"`
	IsTransfer        int     `json:"isTransfer"`
	SwiftCode         *string `json:"swift_code"` // nullable field -> pointer
}

type VietQRResponsePayload struct {
	Code string         `json:"code"`
	Desc string         `json:"desc"`
	Data VietQRCodeData `json:"data"`
}
type VietQRBankResponsePayload struct {
	Code string `json:"code"`
	Desc string `json:"desc"`
	Data []Bank `json:"data"`
}
