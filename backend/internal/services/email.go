package services

import (
	"bytes"
	"fmt"
	"html/template"
	"log"

	"github.com/icst/neon-voice-board/internal/config"
	"github.com/icst/neon-voice-board/internal/models"
	tpl "github.com/icst/neon-voice-board/internal/templates"
	"gopkg.in/gomail.v2"
)

var emailConfig *config.EmailConfig

// InitEmailService initializes the email service
func InitEmailService() {
	emailConfig = config.GetEmailConfig()

	if emailConfig.SenderEmail == "" || emailConfig.Password == "" {
		log.Println("⚠️  Email service not configured. Set SMTP_EMAIL and SMTP_PASSWORD in .env")
	} else {
		log.Println("✅ Email service initialized")
	}
}

// SendEmail sends a basic email
func SendEmail(to, subject, htmlBody string) error {
	if emailConfig.SenderEmail == "" || emailConfig.Password == "" {
		return fmt.Errorf("email service not configured")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("%s <%s>", emailConfig.SenderName, emailConfig.SenderEmail))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", htmlBody)

	d := gomail.NewDialer(emailConfig.SMTPHost, emailConfig.SMTPPort, emailConfig.SenderEmail, emailConfig.Password)

	if err := d.DialAndSend(m); err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("✉️  Email sent to %s: %s", to, subject)
	return nil
}

// SendWelcomeEmail sends welcome email to new user
func SendWelcomeEmail(user models.User) error {
	subject := "স্বাগতম ICST Issue Portal এ! Welcome to ICST Issue Portal!"

	data := map[string]interface{}{
		"Name":       user.Name,
		"Roll":       user.Roll,
		"Department": user.Department,
		"LoginURL":   fmt.Sprintf("%s/user/login", emailConfig.FrontendURL),
	}

	htmlBody, err := renderTemplate("welcome", data)
	if err != nil {
		return err
	}

	return SendEmail(user.Email, subject, htmlBody)
}

// SendIssueSubmittedEmail sends confirmation when issue is submitted
func SendIssueSubmittedEmail(user models.User, issue models.Issue) error {
	subject := fmt.Sprintf("ইস্যু সাবমিট হয়েছে #%s - Issue Submitted", issue.ID[:8])

	data := map[string]interface{}{
		"Name":       user.Name,
		"IssueTitle": issue.Title,
		"IssueID":    issue.ID,
		"Category":   issue.Category,
		"Status":     issue.Status,
		"IssueURL":   fmt.Sprintf("%s/user/my-issues", emailConfig.FrontendURL),
	}

	htmlBody, err := renderTemplate("issue_submitted", data)
	if err != nil {
		return err
	}

	return SendEmail(user.Email, subject, htmlBody)
}

// SendIssueStatusUpdateEmail sends notification when issue status changes
func SendIssueStatusUpdateEmail(user models.User, issue models.Issue, oldStatus, newStatus string) error {
	subject := fmt.Sprintf("ইস্যু আপডেট #%s - Issue Update", issue.ID[:8])

	data := map[string]interface{}{
		"Name":       user.Name,
		"IssueTitle": issue.Title,
		"IssueID":    issue.ID,
		"OldStatus":  oldStatus,
		"NewStatus":  newStatus,
		"IssueURL":   fmt.Sprintf("%s/user/my-issues", emailConfig.FrontendURL),
	}

	htmlBody, err := renderTemplate("issue_update", data)
	if err != nil {
		return err
	}

	return SendEmail(user.Email, subject, htmlBody)
}

// SendIssueResolvedEmail sends notification when issue is resolved
func SendIssueResolvedEmail(user models.User, issue models.Issue) error {
	subject := fmt.Sprintf("✅ ইস্যু সমাধান হয়েছে #%s - Issue Resolved", issue.ID[:8])

	data := map[string]interface{}{
		"Name":       user.Name,
		"IssueTitle": issue.Title,
		"IssueID":    issue.ID,
		"IssueURL":   fmt.Sprintf("%s/user/my-issues", emailConfig.FrontendURL),
	}

	htmlBody, err := renderTemplate("issue_resolved", data)
	if err != nil {
		return err
	}

	return SendEmail(user.Email, subject, htmlBody)
}

// SendPasswordResetEmail sends password reset link
func SendPasswordResetEmail(user models.User, resetToken string) error {
	subject := "পাসওয়ার্ড রিসেট - Password Reset Request"

	resetURL := fmt.Sprintf("%s/reset-password?token=%s", emailConfig.FrontendURL, resetToken)

	data := map[string]interface{}{
		"Name":     user.Name,
		"ResetURL": resetURL,
	}

	htmlBody, err := renderTemplate("password_reset", data)
	if err != nil {
		return err
	}

	return SendEmail(user.Email, subject, htmlBody)
}

// SendBulkEmail sends email to multiple users
func SendBulkEmail(users []models.User, subject, htmlBody string) error {
	var errors []error

	for _, user := range users {
		if err := SendEmail(user.Email, subject, htmlBody); err != nil {
			errors = append(errors, err)
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("failed to send %d emails out of %d", len(errors), len(users))
	}

	return nil
}

// renderTemplate renders HTML email template
func renderTemplate(templateName string, data interface{}) (string, error) {
	tmpl, err := template.ParseFS(tpl.FS, fmt.Sprintf("%s.html", templateName))
	if err != nil {
		log.Printf("Failed to parse template %s: %v", templateName, err)
		// Return a simple HTML fallback
		return fmt.Sprintf("<html><body>%v</body></html>", data), nil
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}
