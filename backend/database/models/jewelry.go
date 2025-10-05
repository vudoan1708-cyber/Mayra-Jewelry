package models

type JewelryVariation string

const (
	Silver    JewelryVariation = "Silver"
	Gold      JewelryVariation = "Gold"
	WhiteGold JewelryVariation = "White Gold"
)

type JewelryPrice struct {
	Id                uint             `json:"id" gorm:"primaryKey"`
	Variation         JewelryVariation `json:"variation" gorm:"index:idx_item_variation,unique"`
	Amount            int32            `json:"amount"`
	JewelryItemInfoId string           `json:"-" gorm:"column:jewelryItemInfoId;index:idx_item_variation,unique"` // foreign key column to JewelryItemInfo.DirectoryId
}

func (JewelryPrice) TableName() string {
	return "jewelry_price"
}

type JewelryItemInfo struct {
	DirectoryId string         `json:"-" gorm:"primaryKey;column:directoryId"` // base64 representation of the name of the jewelry item as a directory name containing images
	ItemName    string         `json:"-" gorm:"column:itemName"`               // Name of the jewelry item
	Description string         `json:"description"`                            // Description of the jewelry item
	Purchases   uint           `json:"-"`                                      // Number of purchases
	Prices      []JewelryPrice `json:"-" gorm:"foreignKey:JewelryItemInfoId;references:DirectoryId"`
}

func (JewelryItemInfo) TableName() string {
	return "jewelry_items"
}

type Metadata struct {
	DirectoryId string         `json:"directoryId"`
	ItemName    string         `json:"itemName"`
	Purchases   uint           `json:"purchases"`
	Prices      []JewelryPrice `json:"prices"`
	Media       []MediaLink    `json:"media"`
}
type AllJewelryItemsResponsePayload map[string]Metadata
