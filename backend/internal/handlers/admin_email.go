package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
	"github.com/icst/neon-voice-board/internal/services"
)

// SendBulkEmailRequest represents bulk email request
type SendBulkEmailRequest struct {
	Subject    string   `json:"subject"`
	Body       string   `json:"body"`
	Recipients string   `json:"recipients"` // "all", "students", "department:<name>"
	HTMLBody   string   `json:"htmlBody"`   // Optional HTML body
}

// SendBulkEmail sends email to multiple users
func SendBulkEmail(c *fiber.Ctx) error {
	var req SendBulkEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request",
		})
	}

	if req.Subject == "" || (req.Body == "" && req.HTMLBody == "") {
		return c.Status(400).JSON(fiber.Map{
			"message": "Subject এবং body required",
		})
	}

	// Get all users
	var allUsers []models.User
	database.GetAll(database.UsersBucket, &allUsers)

	// Filter recipients
	var recipients []models.User
	switch req.Recipients {
	case "all":
		recipients = allUsers
	case "students":
		for _, user := range allUsers {
			if user.Role == "user" {
				recipients = append(recipients, user)
			}
		}
	default:
		// For now, just all users
		recipients = allUsers
	}

	// Prepare email body
	emailBody := req.HTMLBody
	if emailBody == "" {
		// Simple HTML wrapping for plain text
		emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 40px; background: #f4f4f4;">
    <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0;">📢 ICST Issue Portal</h1>
        </div>
        <div style="line-height: 1.6; color: #333;">
` + req.Body + `
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2025 ICST Issue Portal</p>
        </div>
    </div>
</body>
</html>`
	}

	// Send emails in background
	go func() {
		sent := 0
		failed := 0
		for _, user := range recipients {
			if err := services.SendEmail(user.Email, req.Subject, emailBody); err != nil {
				failed++
				log.Printf("Failed to send email to %s: %v", user.Email, err)
			} else {
				sent++
			}
		}
		log.Printf("Bulk email complete: %d sent, %d failed out of %d", sent, failed, len(recipients))
	}()

	return c.JSON(fiber.Map{
		"message": "✅ ব্রডকাস্ট শুরু হয়েছে (Broadcast started)",
		"queued":  len(recipients),
	})
}

// GetEmailHistory returns email sending history (placeholder)
func GetEmailHistory(c *fiber.Ctx) error {
	// For now, return empty array
	// TODO: Implement email logging to database
	return c.JSON(fiber.Map{
		"history": []interface{}{},
		"message": "Email history feature coming soon",
	})
}
