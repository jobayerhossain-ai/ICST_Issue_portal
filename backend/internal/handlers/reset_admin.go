package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
	"github.com/icst/neon-voice-board/internal/utils"
)

// ForceResetAdmin - EMERGENCY: Deletes and recreates admin with known password
func ForceResetAdmin(c *fiber.Ctx) error {
	adminEmail := "jovayerhossain0@gmail.com"
	newPassword := "123456" // NEW PASSWORD!

	// Get all users
	var users []models.User
	database.GetAll(database.UsersBucket, &users)

	// Delete existing admin
	for _, user := range users {
		if user.Email == adminEmail {
			database.Delete(database.UsersBucket, user.ID)
		}
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to hash password",
		})
	}

	// Create fresh admin
	admin := models.User{
		ID:         uuid.New().String(),
		Roll:       "ADMIN",
		Name:       "Administrator",
		Department: "Administration",
		Email:      adminEmail,
		Password:   hashedPassword,
		Role:       "admin",
		CreatedAt:  time.Now(),
	}

	// Save to database
	if err := database.Put(database.UsersBucket, admin.ID, &admin); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to create admin",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"success":  true,
		"message":  "✅ Admin password has been RESET!",
		"email":    adminEmail,
		"password": newPassword,
		"note":     "Use these NEW credentials to login",
	})
}
