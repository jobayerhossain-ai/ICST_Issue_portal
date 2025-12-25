package database

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	bolt "go.etcd.io/bbolt"
)

var db *bolt.DB

// Bucket names
var (
	UsersBucket       = []byte("users")
	IssuesBucket      = []byte("issues")
	CommentsBucket    = []byte("comments")
	ResetTokensBucket = []byte("password_resets")
)

// Init initializes the BoltDB database
func Init() error {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "./data/app.db"
	}

	// Create directory if it doesn't exist
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open database
	var err error
	db, err = bolt.Open(dbPath, 0600, nil)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Create buckets
	return db.Update(func(tx *bolt.Tx) error {
		buckets := [][]byte{UsersBucket, IssuesBucket, CommentsBucket, ResetTokensBucket}
		for _, bucket := range buckets {
			if _, err := tx.CreateBucketIfNotExists(bucket); err != nil {
				return fmt.Errorf("failed to create bucket %s: %w", bucket, err)
			}
		}
		return nil
	})
}

// Close closes the database
func Close() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// GetDB returns the database instance
func GetDB() *bolt.DB {
	return db
}

// Put stores a value in the specified bucket
func Put(bucket []byte, key string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		return b.Put([]byte(key), data)
	})
}

// Get retrieves a value from the specified bucket
func Get(bucket []byte, key string, dest interface{}) error {
	return db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		data := b.Get([]byte(key))
		if data == nil {
			return fmt.Errorf("key not found")
		}
		return json.Unmarshal(data, dest)
	})
}

// GetAll retrieves all values from the specified bucket
func GetAll(bucket []byte, dest interface{}) error {
	var results []json.RawMessage

	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		return b.ForEach(func(k, v []byte) error {
			results = append(results, json.RawMessage(v))
			return nil
		})
	})

	if err != nil {
		return err
	}

	// Marshal and unmarshal to convert []json.RawMessage to dest type
	data, err := json.Marshal(results)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, dest)
}

// Delete removes a value from the specified bucket
func Delete(bucket []byte, key string) error {
	return db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		return b.Delete([]byte(key))
	})
}

// FindOne finds a single document matching the condition
func FindOne(bucket []byte, condition func(data []byte) bool, dest interface{}) error {
	return db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		c := b.Cursor()

		for k, v := c.First(); k != nil; k, v = c.Next() {
			if condition(v) {
				return json.Unmarshal(v, dest)
			}
		}

		return fmt.Errorf("not found")
	})
}

// Count counts documents in a bucket
func Count(bucket []byte) (int, error) {
	var count int

	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		c := b.Cursor()

		for k, _ := c.First(); k != nil; k, _ = c.Next() {
			count++
		}

		return nil
	})

	return count, err
}

// CountWhere counts documents matching condition
func CountWhere(bucket []byte, condition func(data []byte) bool) (int, error) {
	var count int

	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucket)
		c := b.Cursor()

		for k, v := c.First(); k != nil; k, v = c.Next() {
			if condition(v) {
				count++
			}
		}

		return nil
	})

	return count, err
}
