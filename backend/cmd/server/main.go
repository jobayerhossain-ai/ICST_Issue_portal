package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/handlers"
	"github.com/icst/neon-voice-board/internal/middleware"
	"github.com/icst/neon-voice-board/internal/services"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	// Initialize database
	if err := database.Init(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.Close()

	// Initialize email service
	services.InitEmailService()

	// Create Fiber app with optimizations
	app := fiber.New(fiber.Config{
		Prefork:       false, // Set true for production multi-core
		CaseSensitive: true,
		StrictRouting: false,
		ServerHeader:  "Fiber",
		AppName:       "ICST Issue Portal v2.0",
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))

	// Static files
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	app.Static("/uploads", uploadDir)

	// Routes
	api := app.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)
	auth.Get("/me", middleware.Protected, handlers.GetMe)
	auth.Post("/seed-admin", handlers.SeedAdmin)
	auth.Get("/seed-admin", handlers.SeedAdmin)
	auth.Get("/debug-users", handlers.DebugUsers)             // Debug endpoint
	auth.Post("/force-reset-admin", handlers.ForceResetAdmin) // EMERGENCY RESET
	auth.Post("/forgot-password", handlers.ForgotPassword)    // Password reset
	auth.Post("/reset-password", handlers.ResetPassword)      // Password reset

	// User routes
	user := api.Group("/user", middleware.Protected)
	user.Get("/profile", handlers.GetUserProfile)
	user.Put("/profile", handlers.UpdateUserProfile)
	user.Get("/issues", handlers.GetUserIssues)
	user.Get("/stats", handlers.GetUserStats)

	// Issue routes
	issues := api.Group("/issues")
	issues.Get("/", handlers.GetAllIssues)
	issues.Get("/:id", handlers.GetIssueByID)
	issues.Post("/", middleware.Protected, handlers.CreateIssue)
	issues.Patch("/:id", middleware.Protected, handlers.UpdateIssue)
	issues.Delete("/:id", middleware.Protected, middleware.AdminOnly, handlers.DeleteIssue)
	issues.Post("/:id/vote", middleware.Protected, handlers.VoteIssue)

	// Upload routes
	upload := api.Group("/upload")
	upload.Post("/", middleware.Protected, handlers.UploadFile)

	// Admin routes
	admin := api.Group("/admin", middleware.Protected, middleware.AdminOnly)
	admin.Get("/stats", handlers.GetAdminStats)
	admin.Post("/send-bulk-email", handlers.SendBulkEmail)
	admin.Get("/email-history", handlers.GetEmailHistory)

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "ICST Issue Portal API is running",
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Printf("🚀 Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
