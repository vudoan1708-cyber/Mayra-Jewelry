package admin_auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
)

type ctxKey string

const adminCtxKey ctxKey = "admin_claims"

func AdminFromContext(ctx context.Context) (*AdminClaims, bool) {
	claims, ok := ctx.Value(adminCtxKey).(*AdminClaims)
	return claims, ok
}

func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			middleware.HandleErrorResponse(w, http.StatusUnauthorized, "missing bearer token")
			return
		}
		raw := strings.TrimPrefix(header, "Bearer ")
		claims, err := ParseToken(raw)
		if err != nil {
			middleware.HandleErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		if claims.Type != TokenTypeSession {
			middleware.HandleErrorResponse(w, http.StatusUnauthorized, "wrong token type")
			return
		}
		ctx := context.WithValue(r.Context(), adminCtxKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
