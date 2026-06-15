package category

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	categorydomain "shop-api/domain/category"
	"shop-api/domain/growth"
)

type PgxRepository struct {
	pool *pgxpool.Pool
}

func NewPgxRepository(pool *pgxpool.Pool) *PgxRepository {
	return &PgxRepository{pool: pool}
}

func (r *PgxRepository) Count(ctx context.Context) (int, error) {
	var total int

	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM categories").Scan(&total)

	return total, err
}

func (r *PgxRepository) List(ctx context.Context, limit int, offset int) ([]*categorydomain.Category, error) {
	fmt.Println(1)
	rows, err := r.pool.Query(ctx, "SELECT id, title, slug, created_at FROM categories LIMIT $1 OFFSET $2", limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []*categorydomain.Category

	for rows.Next() {
		var id int64
		var title, slug string
		var createdAt time.Time

		if err := rows.Scan(&id, &title, &slug, &createdAt); err != nil {
			return nil, err
		}

		products = append(products, categorydomain.NewCategory(id, title, slug, createdAt))
	}

	return products, rows.Err()
}

func (r *PgxRepository) CountCategoryRevenue(ctx context.Context) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM categories").Scan(&total)
	return total, err
}

func (r *PgxRepository) ListCategoryRevenue(ctx context.Context, limit int, offset int) ([]*categorydomain.CategoryRevenue, error) {
	fmt.Println(1)

	rows, err := r.pool.Query(ctx, `
		SELECT
			c.title,
			COUNT(DISTINCT pc.product_id),
			COALESCE(SUM(oi.quantity * p.price), 0),
			COUNT(DISTINCT oi.order_id),
			COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at >= NOW() - interval '15 days'), 0),
			COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at < NOW() - interval '15 days'), 0)
		FROM categories c
		LEFT JOIN product_categories pc ON pc.category_id = c.id
		LEFT JOIN products p ON p.id = pc.product_id
		LEFT JOIN order_items oi ON oi.product_id = p.id
		LEFT JOIN orders o ON o.id = oi.order_id
		GROUP BY c.id, c.title
		ORDER BY c.title
		LIMIT $1 OFFSET $2
	`, limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var stats []*categorydomain.CategoryRevenue

	for rows.Next() {
		var category string
		var products, orders int
		var revenue, recentRevenue, previousRevenue float64

		if err := rows.Scan(&category, &products, &revenue, &orders, &recentRevenue, &previousRevenue); err != nil {
			return nil, err
		}

		growth := growth.CalculateGrowth(recentRevenue, previousRevenue)

		stats = append(stats, categorydomain.NewCategoryRevenue(category, products, revenue, orders, growth))
	}

	return stats, rows.Err()
}

func (r *PgxRepository) ListCategoryAvaragePrice(ctx context.Context) ([]*categorydomain.CategoryAvaragePrice, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			c.title AS category,
			ROUND(AVG(p.price)::numeric, 2) AS avg_price
		FROM products p
		JOIN product_categories pc ON pc.product_id = p.id
		JOIN categories c ON c.id = pc.category_id
		GROUP BY c.id, c.title LIMIT 100
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var categoryAvaragePrices []*categorydomain.CategoryAvaragePrice

	for rows.Next() {
		var category string
		var avg_price float64

		if err := rows.Scan(&category, &avg_price); err != nil {
			return nil, err
		}

		categoryAvaragePrices = append(categoryAvaragePrices, categorydomain.NewCategoryAvaragePrice(category, avg_price))
	}

	return categoryAvaragePrices, err
}
