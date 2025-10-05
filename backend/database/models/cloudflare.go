package models

type MediaLink struct {
	URL      string `json:"url"`
	FileName string `json:"fileName"`
}
type CloudflareJewelryItemPayload map[string][]MediaLink
