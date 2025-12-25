package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
	"github.com/icst/neon-voice-board/internal/services"
	"github.com/icst/neon-voice-board/internal/utils"
)

// ForgotPassword initiates password reset process
func ForgotPassword(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request",
		})
	}

	// Find user by email
	var users []models.User
	database.GetAll(database.UsersBucket, &users)

	var foundUser *models.User
	for i := range users {
		if users[i].Email == req.Email {
			foundUser = &users[i]
			break
		}
	}

	// Always return success (don't reveal if email exists)
	if foundUser == nil {
		return c.JSON(fiber.Map{
			"message": "যদি email টি valid হয়, আপনি একটি reset link পাবেন (If email is valid, you'll receive a reset link)",
		})
	}

	// Generate reset token
	token := generateResetToken()
	hashedToken := hashToken(token)

	// Create password reset record
	resetRecord := models.PasswordReset{
		ID:        uuid.New().String(),
		UserID:    foundUser.ID,
		Token:     hashedToken,
		Email:     foundUser.Email,
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
		CreatedAt: time.Now(),
	}

	// Save to database
	if err := database.Put(database.ResetTokensBucket, resetRecord.ID, &resetRecord); err != nil {
		log.Printf("Failed to save reset token: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to process request",
		})
	}

	// Send password reset email
	go func() {
		if err := services.SendPasswordResetEmail(*foundUser, token); err != nil {
			log.Printf("Failed to send password reset email: %v", err)
		}
	}()

	return c.JSON(fiber.Map{
		"message": "যদি email টি valid হয়, আপনি একটি reset link পাবেন (If email is valid, you'll receive a reset link)",
	})
}

// ResetPassword resets password using token
func ResetPassword(c *fiber.Ctx) error {
	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request",
		})
	}

	if req.Token == "" || req.NewPassword == "" {
		return c.Status(400).JSON(fiber.Map{
			"message": "Token এবং নতুন পাসওয়ার্ড দিতে হবে (Token and new password required)",
		})
	}

	// Hash the provided token
	hashedToken := hashToken(req.Token)

	// Find reset record
	var allResets []models.PasswordReset
	database.GetAll(database.ResetTokensBucket, &allResets)

	var validReset *models.PasswordReset
	for i := range allResets {
		if allResets[i].Token == hashedToken && !allResets[i].Used && time.Now().Before(allResets[i].ExpiresAt) {
			validReset = &allResets[i]
			break
		}
	}

	if validReset == nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid বা expired token",
		})
	}

	// Get user
	var user models.User
	if err := database.Get(database.UsersBucket, validReset.UserID, &user); err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "User not found",
		})
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to hash password",
		})
	}

	// Update user password
	user.Password = hashedPassword
	if err := database.Put(database.UsersBucket, user.ID, &user); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to update password",
		})
	}

	// Mark token as used
	validReset.Used = true
	database.Put(database.ResetTokensBucket, validReset.ID, validReset)

	return c.JSON(fiber.Map{
		"message": "✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে (Password reset successful)",
	})
}

// generateResetToken generates a random token
func generateResetToken() string {
	return uuid.New().String()
}

// hashToken hashes a token using SHA-256
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
