package models

type JewelryVariation string

const (
	Silver    JewelryVariation = "Silver"
	Gold      JewelryVariation = "Gold"
	WhiteGold JewelryVariation = "White Gold"
)

type JewelryPrice struct {
	Id                uint             `json:"id" gorm:"primaryKey"`
	Variation         JewelryVariation `json:"variation"`
	Amount            int32            `json:"amount"`
	JewelryItemInfoId uint             `json:"-" gorm:"column:jewelryItemInfoId"` // foreign key column
}

func (JewelryPrice) TableName() string {
	return "jewelry_price"
}

type JewelryItemInfo struct {
	Id          uint           `json:"id" gorm:"primaryKey"`
	DirectoryId string         `json:"directoryId" gorm:"column:directoryId"` // base64 representation of the name of a directory containing images
	ItemName    string         `json:"itemName" gorm:"column:itemName"`       // Name of the jewelry item
	Prices      []JewelryPrice `json:"prices" gorm:"foreignKey:JewelryItemInfoId"`
}

func (JewelryItemInfo) TableName() string {
	return "jewelry_items"
}

type Merged struct {
	ImageMetadata
	JewelryItemInfo
}
type AllJewelryItemsResponsePayload map[string][]Merged
