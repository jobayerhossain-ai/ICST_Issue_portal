package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadFile handles file upload
func UploadFile(c *fiber.Ctx) error {
	// Get file from request
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "No file uploaded",
		})
	}

	// Validate file type (only images)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	if !allowedExts[ext] {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid file type. Only images are allowed",
		})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{
			"message": "File size too large. Maximum 5MB",
		})
	}

	// Create uploads directory if not exists
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to create upload directory",
		})
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filepath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveFile(file, filepath); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to save file",
		})
	}

	// Return file URL
	imageURL := fmt.Sprintf("/uploads/%s", filename)

	return c.JSON(fiber.Map{
		"imageUrl": imageURL,
	})
}
