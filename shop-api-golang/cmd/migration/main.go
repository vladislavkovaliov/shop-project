package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:password@localhost:55000/shop?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("unable to ping database: %v", err)
	}

	fmt.Println("Connected to database. Running migration...")

	_, err = pool.Exec(ctx, `
		ALTER TABLE categories
			ADD COLUMN IF NOT EXISTS slug       TEXT DEFAULT '',
			ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
	`)
	if err != nil {
		log.Fatalf("failed to add columns: %v", err)
	}

	fmt.Println("Columns added.")

	result, err := pool.Exec(ctx, `
		UPDATE categories SET
			slug = LOWER(REPLACE(title, ' ', '-')),
			created_at = NOW() - (random() * interval '30 days')
		WHERE slug = '' OR slug IS NULL
	`)

	if err != nil {
		log.Fatalf("failed to update data: %v", err)
	}

	fmt.Printf("Rows updated: %d\n", result.RowsAffected())

	_, err = pool.Exec(ctx, `
		ALTER TABLE categories
			ALTER COLUMN slug SET NOT NULL,
			ADD UNIQUE (slug)
	`)

	if err != nil {
		log.Fatalf("failed to add not null / unique: %v", err)
	}

	fmt.Println("NOT NULL + UNIQUE applied.")
	if err != nil {
		log.Fatalf("failed to update data: %v", err)
	}

	fmt.Printf("Rows updated: %d\n", result.RowsAffected())

	rows, err := pool.Query(ctx, "SELECT id, title, slug, created_at FROM categories ORDER BY id")
	if err != nil {
		log.Fatalf("failed to query categories: %v", err)
	}
	defer rows.Close()

	fmt.Println("\nCategories after migration:")
	for rows.Next() {
		var id int64
		var title, slug string
		var createdAt time.Time
		if err := rows.Scan(&id, &title, &slug, &createdAt); err != nil {
			log.Fatalf("failed to scan row: %v", err)
		}
		fmt.Printf("  id=%d  title=%s  slug=%s  created_at=%s\n", id, title, slug, createdAt.Format(time.RFC3339))
	}

	fmt.Println("\nMigration complete.")
}
