package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
	"github.com/icst/neon-voice-board/internal/services"
	"github.com/icst/neon-voice-board/internal/utils"
)

// Register handles user registration
func Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validation
	if req.Roll == "" || req.Name == "" || req.Department == "" || req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"message":  "সব ফিল্ড পূরণ করা আবশ্যক (All fields are required)",
			"required": []string{"roll", "name", "department", "email", "password"},
		})
	}

	// Check if email already exists
	var existingUsers []models.User
	database.GetAll(database.UsersBucket, &existingUsers)

	for _, user := range existingUsers {
		if user.Email == req.Email {
			return c.Status(400).JSON(fiber.Map{
				"message": "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে (User already exists)",
			})
		}
		if user.Roll == req.Roll {
			return c.Status(400).JSON(fiber.Map{
				"message": "এই রোল নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে (Roll number already registered)",
			})
		}
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to hash password",
		})
	}

	// Create user
	user := models.User{
		ID:         uuid.New().String(),
		Roll:       req.Roll,
		Name:       req.Name,
		Department: req.Department,
		Email:      req.Email,
		Password:   hashedPassword,
		Role:       "user",
		CreatedAt:  time.Now(),
	}

	// Save to database
	if err := database.Put(database.UsersBucket, user.ID, &user); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to create user",
		})
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to generate token",
		})
	}

	// Send welcome email asynchronously
	go func() {
		if err := services.SendWelcomeEmail(user); err != nil {
			log.Printf("Failed to send welcome email to %s: %v", user.Email, err)
		}
	}()

	return c.Status(201).JSON(models.AuthResponse{
		ID:         user.ID,
		Roll:       user.Roll,
		Name:       user.Name,
		Department: user.Department,
		Email:      user.Email,
		Role:       user.Role,
		Token:      token,
	})
}

// Login handles user authentication
func Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
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

	if foundUser == nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "ইমেইল বা পাসওয়ার্ড ভুল (Invalid email or password)",
		})
	}

	// Check password
	if !utils.CheckPassword(req.Password, foundUser.Password) {
		return c.Status(401).JSON(fiber.Map{
			"message": "ইমেইল বা পাসওয়ার্ড ভুল (Invalid email or password)",
		})
	}

	// Generate token
	token, err := utils.GenerateToken(foundUser.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to generate token",
		})
	}

	return c.JSON(models.AuthResponse{
		ID:         foundUser.ID,
		Roll:       foundUser.Roll,
		Name:       foundUser.Name,
		Department: foundUser.Department,
		Email:      foundUser.Email,
		Role:       foundUser.Role,
		Token:      token,
	})
}

// GetMe returns current authenticated user
func GetMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	return c.JSON(user)
}

// SeedAdmin creates the default admin user
func SeedAdmin(c *fiber.Ctx) error {
	adminEmail := "jovayerhossain0@gmail.com"

	// Check if admin already exists
	var users []models.User
	database.GetAll(database.UsersBucket, &users)

	for _, user := range users {
		if user.Email == adminEmail {
			return c.JSON(fiber.Map{
				"message": "Admin already exists",
				"email":   adminEmail,
			})
		}
	}

	// Hash password
	hashedPassword, err := utils.HashPassword("Jovayer1234&")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to hash password",
		})
	}

	// Create admin user
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
			"message": "Failed to seed admin",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":  "Admin user created successfully!",
		"email":    adminEmail,
		"password": "Jovayer1234&",
		"note":     "Please change the password after first login",
	})
}

// GetUserProfile returns user profile
func GetUserProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	return c.JSON(fiber.Map{
		"_id":        user.ID,
		"roll":       user.Roll,
		"name":       user.Name,
		"department": user.Department,
		"email":      user.Email,
		"role":       user.Role,
		"createdAt":  user.CreatedAt,
	})
}

// UpdateUserProfile updates user profile
func UpdateUserProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var updates struct {
		Name       string `json:"name"`
		Department string `json:"department"`
	}

	if err := c.BodyParser(&updates); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Update user
	if updates.Name != "" {
		user.Name = updates.Name
	}
	if updates.Department != "" {
		user.Department = updates.Department
	}

	// Save to database
	if err := database.Put(database.UsersBucket, user.ID, user); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to update profile",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user": fiber.Map{
			"_id":        user.ID,
			"roll":       user.Roll,
			"name":       user.Name,
			"department": user.Department,
			"email":      user.Email,
			"role":       user.Role,
		},
	})
}

// GetUserIssues returns issues submitted by current user
func GetUserIssues(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var allIssues []models.Issue
	database.GetAll(database.IssuesBucket, &allIssues)

	var userIssues []models.Issue
	for _, issue := range allIssues {
		if issue.SubmittedBy == user.ID {
			userIssues = append(userIssues, issue)
		}
	}

	return c.JSON(userIssues)
}

// GetUserStats returns user statistics
func GetUserStats(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var allIssues []models.Issue
	database.GetAll(database.IssuesBucket, &allIssues)

	stats := models.StatsResponse{
		Total:      0,
		Pending:    0,
		InProgress: 0,
		Resolved:   0,
	}

	for _, issue := range allIssues {
		if issue.SubmittedBy == user.ID {
			stats.Total++
			switch issue.Status {
			case "pending":
				stats.Pending++
			case "in-progress":
				stats.InProgress++
			case "resolved":
				stats.Resolved++
			}
		}
	}

	return c.JSON(stats)
}

// GetAdminStats returns admin statistics
func GetAdminStats(c *fiber.Ctx) error {
	var allIssues []models.Issue
	database.GetAll(database.IssuesBucket, &allIssues)

	var allUsers []models.User
	database.GetAll(database.UsersBucket, &allUsers)

	stats := models.AdminStatsResponse{
		TotalIssues:    len(allIssues),
		PendingIssues:  0,
		ResolvedIssues: 0,
		TotalUsers:     len(allUsers),
	}

	for _, issue := range allIssues {
		switch issue.Status {
		case "pending":
			stats.PendingIssues++
		case "resolved":
			stats.ResolvedIssues++
		}
	}

	return c.JSON(stats)
}
