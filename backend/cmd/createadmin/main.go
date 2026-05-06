package main

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/mdp/qrterminal/v3"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/admin_auth"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/database/models"
	"golang.org/x/term"
)

func main() {
	emailFlag := flag.String("email", "", "admin email address (required)")
	flag.Parse()

	if _, err := os.Stat(".env"); err == nil {
		_ = godotenv.Load()
	}

	email := strings.TrimSpace(strings.ToLower(*emailFlag))
	if email == "" {
		fmt.Print("Email: ")
		reader := bufio.NewReader(os.Stdin)
		line, err := reader.ReadString('\n')
		if err != nil {
			log.Fatalf("could not read email: %v", err)
		}
		email = strings.TrimSpace(strings.ToLower(line))
	}
	if email == "" || !strings.Contains(email, "@") {
		log.Fatal("a valid email is required")
	}

	password := readPassword("Password: ")
	if len(password) < 12 {
		log.Fatal("password must be at least 12 characters")
	}
	confirm := readPassword("Confirm password: ")
	if password != confirm {
		log.Fatal("passwords do not match")
	}

	if _, err := database.DatabaseInstance.Init(); err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	if err := database.DatabaseInstance.AutoMigrate(); err != nil {
		log.Fatalf("auto-migrate failed: %v", err)
	}

	existing := models.AdminUser{}
	if err := database.DatabaseInstance.Gorm.
		Where(&models.AdminUser{Email: email}).
		First(&existing).Error; err == nil {
		log.Fatalf("admin with email %s already exists", email)
	}

	hash, err := admin_auth.HashPassword(password)
	if err != nil {
		log.Fatalf("could not hash password: %v", err)
	}

	otpAuthURL, plainSecret, err := admin_auth.GenerateTotpSecret(email)
	if err != nil {
		log.Fatalf("could not generate totp secret: %v", err)
	}
	cipher, nonce, err := admin_auth.EncryptTotpSecret(plainSecret)
	if err != nil {
		log.Fatalf("could not encrypt totp secret: %v", err)
	}

	id, err := newID()
	if err != nil {
		log.Fatalf("could not generate id: %v", err)
	}
	admin := models.AdminUser{
		Id:               id,
		Email:            email,
		PasswordHash:     hash,
		TotpSecretCipher: cipher,
		TotpSecretNonce:  nonce,
	}
	if err := database.DatabaseInstance.Gorm.Create(&admin).Error; err != nil {
		log.Fatalf("could not insert admin: %v", err)
	}

	fmt.Println()
	fmt.Println("✅ Admin created.")
	fmt.Println("Scan this QR with Google Authenticator / Authy / 1Password:")
	fmt.Println()
	qrterminal.GenerateHalfBlock(otpAuthURL, qrterminal.L, os.Stdout)
	fmt.Println()
	fmt.Println("If your terminal cannot render the QR, paste this URI into your authenticator:")
	fmt.Println(otpAuthURL)
	fmt.Println()
	fmt.Println("Manual entry secret:", plainSecret)
}

func readPassword(prompt string) string {
	fmt.Print(prompt)
	pw, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Println()
	if err != nil {
		log.Fatalf("could not read password: %v", err)
	}
	return string(pw)
}

func newID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
