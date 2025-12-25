FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

# Run stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/server .

# Create uploads and data directory
RUN mkdir -p ./uploads && mkdir -p ./data

# Expose port
EXPOSE 5000

# Command to run
CMD ["./server"]
