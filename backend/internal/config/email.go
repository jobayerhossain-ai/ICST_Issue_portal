package config

import "os"

// EmailConfig holds email/SMTP configuration
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     int
	SenderEmail  string
	SenderName   string
	Password     string
	FrontendURL  string
}

// GetEmailConfig returns email configuration from environment
func GetEmailConfig() *EmailConfig {
	return &EmailConfig{
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     587,
		SenderEmail:  getEnv("SMTP_EMAIL", ""),
		SenderName:   getEnv("SMTP_SENDER_NAME", "ICST Issue Portal"),
		Password:     getEnv("SMTP_PASSWORD", ""),
		FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:8080"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
