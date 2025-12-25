package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/icst/neon-voice-board/internal/database"
	"github.com/icst/neon-voice-board/internal/models"
)

// GetAllIssues returns all issues
func GetAllIssues(c *fiber.Ctx) error {
	var issues []models.Issue
	if err := database.GetAll(database.IssuesBucket, &issues); err != nil {
		return c.JSON([]models.Issue{})
	}
	return c.JSON(issues)
}

// GetIssueByID returns a single issue
func GetIssueByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var issue models.Issue
	if err := database.Get(database.IssuesBucket, id, &issue); err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "Issue not found",
		})
	}

	return c.JSON(issue)
}

// CreateIssue creates a new issue
func CreateIssue(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var req models.CreateIssueRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validation
	if req.Title == "" || req.Description == "" || req.Category == "" {
		return c.Status(400).JSON(fiber.Map{
			"message": "Title, description and category are required",
		})
	}

	// Create issue
	issue := models.Issue{
		ID:           uuid.New().String(),
		Title:        req.Title,
		Description:  req.Description,
		Category:     req.Category,
		Priority:     req.Priority,
		Status:       "pending",
		ImageURL:     req.ImageURL,
		SubmittedBy:  user.ID,
		Votes:        0,
		VotedUsers:   []string{},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Set default priority if not provided
	if issue.Priority == "" {
		issue.Priority = "medium"
	}

	// Save to database
	if err := database.Put(database.IssuesBucket, issue.ID, &issue); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to create issue",
		})
	}

	return c.Status(201).JSON(issue)
}

// UpdateIssue updates an existing issue
func UpdateIssue(c *fiber.Ctx) error {
	id := c.Params("id")
	user := c.Locals("user").(*models.User)

	var issue models.Issue
	if err := database.Get(database.IssuesBucket, id, &issue); err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "Issue not found",
		})
	}

	// Check authorization (owner or admin)
	if user.Role != "admin" && issue.SubmittedBy != user.ID {
		return c.Status(403).JSON(fiber.Map{
			"message": "Not authorized to update this issue",
		})
	}

	var req models.UpdateIssueRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Update fields
	if req.Title != "" {
		issue.Title = req.Title
	}
	if req.Description != "" {
		issue.Description = req.Description
	}
	if req.Status != "" {
		issue.Status = req.Status
	}
	if req.Priority != "" {
		issue.Priority = req.Priority
	}

	issue.UpdatedAt = time.Now()

	// Save to database
	if err := database.Put(database.IssuesBucket, issue.ID, &issue); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to update issue",
		})
	}

	return c.JSON(issue)
}

// DeleteIssue deletes an issue (admin only)
func DeleteIssue(c *fiber.Ctx) error {
	id := c.Params("id")

	// Delete from database
	if err := database.Delete(database.IssuesBucket, id); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to delete issue",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Issue deleted successfully",
	})
}

// VoteIssue handles voting on an issue
func VoteIssue(c *fiber.Ctx) error {
	id := c.Params("id")
	user := c.Locals("user").(*models.User)

	var issue models.Issue
	if err := database.Get(database.IssuesBucket, id, &issue); err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "Issue not found",
		})
	}

	// Check if user already voted
	voted := false
	for i, votedUserID := range issue.VotedUsers {
		if votedUserID == user.ID {
			// Remove vote (unvote)
			issue.VotedUsers = append(issue.VotedUsers[:i], issue.VotedUsers[i+1:]...)
			issue.Votes--
			voted = true
			break
		}
	}

	// Add vote if not voted
	if !voted {
		issue.VotedUsers = append(issue.VotedUsers, user.ID)
		issue.Votes++
	}

	issue.UpdatedAt = time.Now()

	// Save to database
	if err := database.Put(database.IssuesBucket, issue.ID, &issue); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to update vote",
		})
	}

	return c.JSON(issue)
}
