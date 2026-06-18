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

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("unable to connect: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("unable to ping: %v", err)
	}

	fmt.Println("Connected. Seeding daily_user_registrations...")

	result, err := pool.Exec(ctx, `
		INSERT INTO daily_user_registrations (created_at, count)
		SELECT reg_date::date, COUNT(*) AS count
		FROM (
			SELECT
				CASE
					WHEN first_order IS NOT NULL THEN first_order - (random() * interval '10 days')::interval
					ELSE NOW() - (random() * interval '30 days')::interval
				END AS reg_date
			FROM (
				SELECT u.id, MIN(o.created_at) AS first_order
				FROM users u
				LEFT JOIN orders o ON o.user_id = u.id
				GROUP BY u.id
			) sub
		) reg
		GROUP BY reg_date::date
		ON CONFLICT (created_at) DO UPDATE SET count = EXCLUDED.count
	`)
	if err != nil {
		log.Fatalf("seed failed: %v", err)
	}

	fmt.Printf("Rows affected: %d\n", result.RowsAffected())
	fmt.Println("Seed complete.")
}
