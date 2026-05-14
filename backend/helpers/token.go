package helpers

import (
	"crypto/rand"
	"encoding/base64"
)

// GenerateToken returns a URL-safe random token derived from byteLength random
// bytes. 8 bytes yields an 11-char base64url string with 64 bits of entropy.
func GenerateToken(byteLength int) (string, error) {
	buffer := make([]byte, byteLength)
	if _, readErr := rand.Read(buffer); readErr != nil {
		return "", readErr
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}
