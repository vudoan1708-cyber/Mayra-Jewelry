package admin_auth

import (
	"encoding/base64"
	"errors"
	"os"

	"github.com/pquerna/otp/totp"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
)

const totpIssuer = "Mayra Jewelry Admin"

var ErrTotpKeyMissing = errors.New("ADMIN_TOTP_ENCRYPTION_KEY is not set")
var ErrInvalidTotpCode = errors.New("invalid totp code")

func totpEncryptionKey() ([]byte, error) {
	raw := os.Getenv("ADMIN_TOTP_ENCRYPTION_KEY")
	if raw == "" {
		return nil, ErrTotpKeyMissing
	}
	key, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, err
	}
	if len(key) != 32 {
		return nil, errors.New("ADMIN_TOTP_ENCRYPTION_KEY must decode to 32 bytes")
	}
	return key, nil
}

func GenerateTotpSecret(accountEmail string) (otpAuthURL string, plainSecret string, err error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      totpIssuer,
		AccountName: accountEmail,
	})
	if err != nil {
		return "", "", err
	}
	return key.URL(), key.Secret(), nil
}

func EncryptTotpSecret(plainSecret string) (cipher []byte, nonce []byte, err error) {
	key, err := totpEncryptionKey()
	if err != nil {
		return nil, nil, err
	}
	return helpers.Encrypt([]byte(plainSecret), key)
}

func decryptTotpSecret(cipher, nonce []byte) (string, error) {
	key, err := totpEncryptionKey()
	if err != nil {
		return "", err
	}
	plain, err := helpers.Decrypt(cipher, key, nonce)
	if err != nil {
		return "", err
	}
	return string(plain), nil
}

func ValidateTotpCode(code string, cipher, nonce []byte) (bool, error) {
	secret, err := decryptTotpSecret(cipher, nonce)
	if err != nil {
		return false, err
	}
	return totp.Validate(code, secret), nil
}
