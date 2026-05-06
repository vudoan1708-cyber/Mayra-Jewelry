package admin_auth

import (
	"encoding/base64"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	TokenTypePending = "totp_pending"
	TokenTypeSession = "session"

	pendingTokenTTL = 5 * time.Minute
	sessionTokenTTL = 8 * time.Hour
)

var ErrJwtSecretMissing = errors.New("ADMIN_JWT_SECRET is not set")

type AdminClaims struct {
	Type  string `json:"type"`
	Email string `json:"email,omitempty"`
	jwt.RegisteredClaims
}

func jwtSecret() ([]byte, error) {
	raw := os.Getenv("ADMIN_JWT_SECRET")
	if raw == "" {
		return nil, ErrJwtSecretMissing
	}
	key, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, err
	}
	if len(key) < 32 {
		return nil, errors.New("ADMIN_JWT_SECRET must decode to at least 32 bytes")
	}
	return key, nil
}

func issue(adminID, email, tokenType string, ttl time.Duration) (string, error) {
	key, err := jwtSecret()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := AdminClaims{
		Type:  tokenType,
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   adminID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "mayra-admin",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(key)
}

func IssuePendingToken(adminID string) (string, error) {
	return issue(adminID, "", TokenTypePending, pendingTokenTTL)
}

func IssueSessionToken(adminID, email string) (string, error) {
	return issue(adminID, email, TokenTypeSession, sessionTokenTTL)
}

func ParseToken(raw string) (*AdminClaims, error) {
	key, err := jwtSecret()
	if err != nil {
		return nil, err
	}
	parsed, err := jwt.ParseWithClaims(raw, &AdminClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return key, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := parsed.Claims.(*AdminClaims)
	if !ok || !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
