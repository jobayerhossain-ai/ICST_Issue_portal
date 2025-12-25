package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"id"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for the user
func GenerateToken(userID string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_key_change_this"
	}

	expirationTime := time.Now().Add(30 * 24 * time.Hour) // 30 days

	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// VerifyToken verifies and parses a JWT token
func VerifyToken(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_key_change_this"
	}

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}
