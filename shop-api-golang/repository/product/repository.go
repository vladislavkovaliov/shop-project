package product

import (
	"context"
	"math"

	"github.com/jackc/pgx/v5/pgxpool"

	"shop-api/domain/growth"
	proddomain "shop-api/domain/product"
)

type PgxRepository struct {
	pool *pgxpool.Pool
}

func NewPgxRepository(pool *pgxpool.Pool) *PgxRepository {
	return &PgxRepository{pool: pool}
}

func (r *PgxRepository) Count(ctx context.Context) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM products").Scan(&total)
	return total, err
}

func (r *PgxRepository) ListCursor(ctx context.Context, cursor int, limit int) ([]*proddomain.Product, error) {
	var query string
	var args []any

	if cursor > 0 {
		query = `
			SELECT p.id, p.title, p.price, COALESCE(c.title, '') AS category FROM products p
			LEFT JOIN LATERAL (
				SELECT c.title FROM product_categories pc
				JOIN categories c ON c.id = pc.category_id
				WHERE pc.product_id = p.id 
				LIMIT 1
			) c ON TRUE WHERE p.id > $1 ORDER BY p.id ASC LIMIT $2
		`
		args = []any{cursor, limit}
	} else {
		query = `
			SELECT p.id, p.title, p.price, COALESCE(c.title, '') AS category FROM products p
			LEFT JOIN LATERAL (
				SELECT c.title FROM product_categories pc
				JOIN categories c ON c.id = pc.category_id
				WHERE pc.product_id = p.id 
				LIMIT 1
			) c ON TRUE ORDER BY p.id ASC LIMIT $1
		`
		args = []any{limit}
	}

	rows, err := r.pool.Query(ctx, query, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []*proddomain.Product

	for rows.Next() {
		var id int64
		var title string
		var price float64
		var category string

		if err := rows.Scan(&id, &title, &price, &category); err != nil {
			return nil, err
		}

		products = append(products, proddomain.NewProduct(id, title, price, category))
	}

	return products, rows.Err()
}

func (r *PgxRepository) Create(ctx context.Context, title string, price float64, categoryID *int64) (*proddomain.Product, error) {
	var id int64
	var category string

	err := r.pool.QueryRow(ctx, `
		WITH new_product AS (
			INSERT INTO products (title, price)
			VALUES ($1, $2)
			RETURNING id, title, price
		),
		new_category AS (
			INSERT INTO product_categories (product_id, category_id)
			SELECT id, $3::BIGINT FROM new_product WHERE $3::BIGINT IS NOT NULL
			ON CONFLICT DO NOTHING
			RETURNING product_id, category_id
		)
		SELECT p.id, COALESCE(c.title, '') AS category
		FROM new_product p
		LEFT JOIN new_category nc ON nc.product_id = p.id
		LEFT JOIN categories c ON c.id = nc.category_id
	`, title, price, categoryID).Scan(&id, &category)

	if err != nil {
		return nil, err
	}

	return proddomain.NewProduct(id, title, price, category), nil
}

func (r *PgxRepository) List(ctx context.Context, limit int, offset int) ([]*proddomain.Product, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT p.id, p.title, p.price, COALESCE(c.title, '') AS category FROM products p
		LEFT JOIN LATERAL (
			SELECT c.title FROM product_categories pc
			JOIN categories c ON c.id = pc.category_id
			WHERE pc.product_id = p.id 
			LIMIT 1
		) c ON TRUE LIMIT $1 OFFSET $2
	`, limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []*proddomain.Product

	for rows.Next() {
		var id int64
		var title string
		var price float64
		var category string

		if err := rows.Scan(&id, &title, &price, &category); err != nil {
			return nil, err
		}

		products = append(products, proddomain.NewProduct(id, title, price, category))
	}

	return products, rows.Err()
}

func (r *PgxRepository) ListRevenueReport(ctx context.Context, limit int, offset int) ([]*proddomain.RevenueReport, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			p.title,
			COALESCE(SUM(oi.quantity * p.price), 0) AS revenue,
			COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at >= NOW() - interval '15 days'), 0) AS recent,
			COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at < NOW() - interval '15 days'), 0) AS previous
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		JOIN orders o ON o.id = oi.order_id
		GROUP BY p.id, p.title
		ORDER BY revenue DESC LIMIT $1 OFFSET $2
	`, limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var totalRevenues []*proddomain.RevenueReport

	for rows.Next() {
		var title string
		var revenue, recentRevenue, previousRevenue float64

		if err := rows.Scan(&title, &revenue, &recentRevenue, &previousRevenue); err != nil {
			return nil, err
		}

		growth := growth.CalculateGrowth(recentRevenue, previousRevenue)

		totalRevenues = append(totalRevenues, proddomain.NewRevenueReport(title, revenue, growth))
	}

	return totalRevenues, rows.Err()
}

func (r *PgxRepository) GetRevenueStats(ctx context.Context) (*proddomain.RevenueStats, error) {
	var totalRevenue float64
	var averageOrderValue float64
	var totalProductsSold int64

	err := r.pool.QueryRow(ctx, `
		SELECT
		COALESCE(SUM(oi.quantity * p.price), 0) AS total_revenue,
		COALESCE(SUM(oi.quantity * p.price), 0) / NULLIF(COUNT(DISTINCT o.id), 0) AS avg_order_value,
		COALESCE(SUM(oi.quantity), 0) AS total_products_sold
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		JOIN orders o ON o.id = oi.order_id
	`).Scan(&totalRevenue, &averageOrderValue, &totalProductsSold)

	if err != nil {
		return nil, err
	}

	return proddomain.NewRevenueStats(
		math.Round(totalRevenue*100)/100,
		math.Round(averageOrderValue*100)/100,
		totalProductsSold,
	), err
}
