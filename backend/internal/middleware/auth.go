package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
	"github.com/icst/neon-voice-board/internal/utils"
)

// Protected middleware verifies JWT token
func Protected(c *fiber.Ctx) error {
	// Get Authorization header
	auth := c.Get("Authorization")
	if auth == "" {
		return c.Status(401).JSON(fiber.Map{
			"message": "Not authorized, no token",
		})
	}

	// Extract token
	tokenString := strings.TrimPrefix(auth, "Bearer ")
	if tokenString == auth {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid authorization format",
		})
	}

	// Verify token
	claims, err := utils.VerifyToken(tokenString)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "Not authorized, token failed",
		})
	}

	// Get user from database
	var user models.User
	if err := database.Get(database.UsersBucket, claims.UserID, &user); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "Not authorized, user not found",
		})
	}

	// Store user in context
	c.Locals("user", &user)

	return c.Next()
}

// AdminOnly middleware checks if user is admin
func AdminOnly(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	if user.Role != "admin" {
		return c.Status(403).JSON(fiber.Map{
			"message": "Not authorized as an admin",
		})
	}

	return c.Next()
}
