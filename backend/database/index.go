package database

import (
	"fmt"
	"log"
	"os"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database struct {
	instance *gorm.DB
}

func (db *Database) AutoMigrate() error {
	log.Println("Database auto-migrating...")
	var allModels = []interface{}{
		&models.JewelryItemInfo{},
		&models.JewelryPrice{},
	}
	if auto_migrate_err := db.instance.AutoMigrate(allModels...); auto_migrate_err != nil {
		return auto_migrate_err
	}
	log.Println("✅ Database migration complete")
	return nil
}

func (db *Database) Init() (*Database, error) {
	connectionString := os.Getenv("SUPABASE_CONNECTION_URI")
	if connectionString == "" {
		return nil, fmt.Errorf("connection string not found")
	}
	log.Println("Database connecting...")
	gorm_db, err := gorm.Open(postgres.Open(connectionString), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	log.Println("✅ Database connection complete")

	db.instance = gorm_db

	return db, nil
}

func (db *Database) Create(value interface{}) *gorm.DB {
	return db.instance.Create(value)
}

var DatabaseInstance = &Database{}
