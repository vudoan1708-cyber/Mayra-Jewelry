package models

type ImageMetadata struct {
	URL      string `json:"url"`
	FileName string `json:"fileName"`
}
type CloudflareJewelryItemPayload map[string][]ImageMetadata
