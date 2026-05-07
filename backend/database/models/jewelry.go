package models

type JewelryVariation string

const (
	Silver    JewelryVariation = "Silver"
	Gold      JewelryVariation = "Gold"
	WhiteGold JewelryVariation = "White Gold"
)

type JewelryType string

const (
	Ring     JewelryType = "ring"
	Bracelet JewelryType = "bracelet"
)

type JewelryPrice struct {
	Id                uint             `json:"id" gorm:"primaryKey"`
	Variation         JewelryVariation `json:"variation" gorm:"index:idx_item_variation,unique"`
	Amount            int32            `json:"amount"`
	Currency          string           `json:"currency"`
	Discount          float32          `json:"discount"`
	JewelryItemInfoId string           `json:"-" gorm:"column:jewelryItemInfoId;index:idx_item_variation,unique"` // foreign key column to JewelryItemInfo.DirectoryId
}

func (JewelryPrice) TableName() string {
	return "jewelry_price"
}

// JewelryTranslation holds locale-specific copy. Empty fields fall back to the base record.
type JewelryTranslation struct {
	ItemName          string `json:"itemName,omitempty"`
	Description       string `json:"description,omitempty"`
	FeatureCollection string `json:"featureCollection,omitempty"`
}

// JewelryTranslations maps locale code (e.g. "en") -> translation. Adding a locale requires no schema change.
type JewelryTranslations map[string]JewelryTranslation

type JewelryItemInfo struct {
	DirectoryId       string              `json:"directoryId" gorm:"primaryKey;column:directoryId"` // base64 representation of the name of the jewelry item as a directory name containing images
	ItemName          string              `json:"itemName" gorm:"column:itemName"`                  // Base copy (Vietnamese)
	Description       string              `json:"description"`                                      // Base description (Vietnamese)
	Purchases         uint                `json:"purchases"`                                        // Number of purchases
	FeatureCollection string              `json:"featureCollection" gorm:"column:featureCollection"`
	BestSeller        bool                `json:"bestSeller" gorm:"column:bestSeller"`
	Type              JewelryType         `json:"type"`
	ViewCount         uint                `json:"views" gorm:"column:views"`
	Currency          string              `json:"currency"`
	InStock           bool                `json:"inStock" gorm:"column:inStock"`
	Giftable          bool                `json:"giftable" gorm:"column:giftable"`
	Translations      JewelryTranslations `json:"translations" gorm:"column:translations;type:jsonb;serializer:json"`
	Prices            []JewelryPrice      `json:"prices" gorm:"foreignKey:JewelryItemInfoId;references:DirectoryId"`
	Media             []MediaLink         `json:"media" gorm:"-"`
	OrderJewelryItems []OrderJewelryItem  `json:"orderJewelryItems" gorm:"foreignKey:JewelryId;references:DirectoryId"`
}

func (JewelryItemInfo) TableName() string {
	return "jewelry_items"
}

type Metadata struct {
	DirectoryId       string              `json:"directoryId"`
	ItemName          string              `json:"itemName"`
	Description       string              `json:"description"`
	Purchases         uint                `json:"purchases"`
	FeatureCollection string              `json:"featureCollection"`
	BestSeller        bool                `json:"bestSeller"`
	Type              JewelryType         `json:"type"`
	ViewCount         uint                `json:"views"`
	Currency          string              `json:"currency"`
	InStock           bool                `json:"inStock"`
	Giftable          bool                `json:"giftable"`
	Translations      JewelryTranslations `json:"translations"`
	Prices            []JewelryPrice      `json:"prices"`
	Media             []MediaLink         `json:"media"`
}
type JewelryItemsResponsePayload map[string]Metadata
