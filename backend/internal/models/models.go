package models

import "time"

type User struct {
	ID         string    `json:"_id"`
	Roll       string    `json:"roll"`
	Name       string    `json:"name"`
	Department string    `json:"department"`
	Email      string    `json:"email"`
	Password   string    `json:"-"` // Hidden from JSON
	Role       string    `json:"role"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Issue struct {
	ID           string    `json:"_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Category     string    `json:"category"`
	Priority     string    `json:"priority"`
	Status       string    `json:"status"`
	ImageURL     string    `json:"imageUrl,omitempty"`
	SubmittedBy  string    `json:"submittedBy"`
	Votes        int       `json:"votes"`
	VotedUsers   []string  `json:"votedUsers"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Comment struct {
	ID        string    `json:"_id"`
	IssueID   string    `json:"issueId"`
	UserID    string    `json:"userId"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

// Request/Response DTOs
type RegisterRequest struct {
	Roll       string `json:"roll"`
	Name       string `json:"name"`
	Department string `json:"department"`
	Email      string `json:"email"`
	Password   string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	ID         string `json:"_id"`
	Roll       string `json:"roll,omitempty"`
	Name       string `json:"name,omitempty"`
	Department string `json:"department,omitempty"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Token      string `json:"token"`
}

type CreateIssueRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Priority    string `json:"priority"`
	ImageURL    string `json:"imageUrl,omitempty"`
}

type UpdateIssueRequest struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Status      string `json:"status,omitempty"`
	Priority    string `json:"priority,omitempty"`
}

type StatsResponse struct {
	Total      int `json:"total"`
	Pending    int `json:"pending"`
	InProgress int `json:"inProgress"`
	Resolved   int `json:"resolved"`
}

type AdminStatsResponse struct {
	TotalIssues    int `json:"totalIssues"`
	PendingIssues  int `json:"pendingIssues"`
	ResolvedIssues int `json:"resolvedIssues"`
	TotalUsers     int `json:"totalUsers"`
}
