package database

import (
	"log"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
)

// legacyEnTranslations holds the hardcoded English copy that previously lived in
// frontend/src/i18n/productCopy.ts. The keys are jewelry directoryIds (base64-encoded item names).
var legacyEnTranslations = map[string]models.JewelryTranslation{
	// Vĩnh Ngân
	"VsSpbmggTmfDom4=": {
		ItemName: "Eternal Silver",
		Description: "A union of 'eternity' and 'silver light' — evoking a love that endures, pure as silver caught in morning light.\n" +
			"Each band is crafted in luminous silver, the surface lightly brushed so it catches and scatters light as the angle shifts.\n" +
			"Simple yet meticulously finished — a quiet symbol of harmony and union, made for couples who favour an elegant, sincere line.",
	},
	// Giọt Ánh Trăng
	"R2nhu410IMOBbmggVHLEg25n": {
		ItemName: "Drops of Moonlight",
		Description: "Inspired by the clear sparkle of small stones — like drops of moonlight falling onto a mysterious black-velvet sky.\n" +
			"The band is shaped in luminous silver, set with three small round stones arranged in a vertical line.\n" +
			"Each stone glows softly, catching natural light with a quiet grace.\n" +
			"The whole feels pure and minimal, yet full of allure — made for those drawn to a refined, gentle style.",
	},
}

// legacyEnFeatureCollections maps base (Vietnamese) collection names to their English equivalents.
var legacyEnFeatureCollections = map[string]string{
	"Nhẫn đôi": "Couple Rings",
}

// BackfillJewelryTranslations writes the legacy English copy into translations["en"] for any
// jewelry item whose translation slot is still empty. It never overwrites admin-edited values,
// so re-running on every startup is safe.
func (db *Database) BackfillJewelryTranslations() error {
	var items []models.JewelryItemInfo
	if err := db.Gorm.Find(&items).Error; err != nil {
		return err
	}
	updated := 0
	for i := range items {
		item := &items[i]
		legacyEntry, hasItemLegacy := legacyEnTranslations[item.DirectoryId]
		legacyCollection, hasCollectionLegacy := legacyEnFeatureCollections[item.FeatureCollection]
		if !hasItemLegacy && !hasCollectionLegacy {
			continue
		}
		if item.Translations == nil {
			item.Translations = models.JewelryTranslations{}
		}
		en := item.Translations["en"]
		changed := false
		if hasItemLegacy {
			if en.ItemName == "" && legacyEntry.ItemName != "" {
				en.ItemName = legacyEntry.ItemName
				changed = true
			}
			if en.Description == "" && legacyEntry.Description != "" {
				en.Description = legacyEntry.Description
				changed = true
			}
		}
		if hasCollectionLegacy && en.FeatureCollection == "" && legacyCollection != "" {
			en.FeatureCollection = legacyCollection
			changed = true
		}
		if !changed {
			continue
		}
		item.Translations["en"] = en
		if err := db.Gorm.Model(item).Update("translations", item.Translations).Error; err != nil {
			return err
		}
		updated++
	}
	if updated > 0 {
		log.Printf("✅ Backfilled English translations for %d jewelry item(s)", updated)
	}
	return nil
}
