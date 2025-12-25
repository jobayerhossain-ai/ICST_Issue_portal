package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
)

// DebugUsers returns all users for debugging
func DebugUsers(c *fiber.Ctx) error {
	var users []models.User
	database.GetAll(database.UsersBucket, &users)
	
	// Return limited info (don't expose passwords)
	result := make([]map[string]interface{}, 0)
	for _, user := range users {
		result = append(result, map[string]interface{}{
			"_id":        user.ID,
			"email":      user.Email,
			"role":       user.Role,
			"name":       user.Name,
			"createdAt":  user.CreatedAt,
		})
	}
	
	return c.JSON(fiber.Map{
		"count": len(users),
		"users": result,
	})
}
