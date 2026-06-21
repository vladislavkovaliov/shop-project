package order

import (
	"context"
	"fmt"
	"math"
	"time"

	"shop-api/domain/growth"
	orderdomain "shop-api/domain/order"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PgxRepository struct {
	pool *pgxpool.Pool
}

func NewPgxRepository(pool *pgxpool.Pool) *PgxRepository {
	return &PgxRepository{pool: pool}
}

func (r *PgxRepository) Count(ctx context.Context) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM orders").Scan(&total)
	return total, err
}

func (r *PgxRepository) CountDailyStats(ctx context.Context) (int, error) {
	var total int

	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) AS total FROM (
			SELECT o.created_at
			FROM order_items oi
			JOIN products p ON oi.product_id = p.id
			JOIN orders o ON oi.order_id = o.id
			GROUP BY o.created_at
		) AS sub;
	`).Scan(&total)

	return total, err
}

func (r *PgxRepository) List(ctx context.Context, limit int, offset int) ([]*orderdomain.Order, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, user_id, created_at FROM orders LIMIT $1 OFFSET $2", limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var orders []*orderdomain.Order

	for rows.Next() {
		var id int64
		var userID int64
		var createdAt time.Time

		if err := rows.Scan(&id, &userID, &createdAt); err != nil {
			return nil, err
		}

		orders = append(orders, orderdomain.NewOrder(id, userID, createdAt))
	}

	return orders, rows.Err()
}

func (r *PgxRepository) ListDailyPurchases(ctx context.Context) ([]*orderdomain.DailyPurchases, error) {
	// rows, err := r.pool.Query(ctx, `
	// SELECT
	// 	created_at::date AS order_date,
	// 	COUNT(*)         AS purchases
	// FROM orders
	// GROUP BY order_date
	// ORDER BY order_date
	// `)

	rows, err := r.pool.Query(ctx, `
		SELECT order_date, purchases FROM daily_purchases ORDER BY order_date
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var dailyPurchases []*orderdomain.DailyPurchases

	for rows.Next() {
		var order_date time.Time
		var purchases int

		if err := rows.Scan(&order_date, &purchases); err != nil {
			return nil, err
		}

		dailyPurchases = append(dailyPurchases, orderdomain.NewDailyPurchases(order_date, purchases))
	}

	return dailyPurchases, rows.Err()
}

func (r *PgxRepository) Create(ctx context.Context, userID int64, items []orderdomain.CreateItem) (*orderdomain.Order, []*orderdomain.OrderItem, error) {
	tx, err := r.pool.Begin(ctx)

	if err != nil {
		return nil, nil, err
	}

	defer tx.Rollback(ctx)

	var orderID int64
	var createdAt time.Time
	fmt.Println(1)

	err = tx.QueryRow(ctx, `
		INSERT INTO orders (user_id) VALUES ($1) RETURNING id, created_at
	`, userID).Scan(&orderID, &createdAt)

	if err != nil {
		return nil, nil, err
	}

	for _, item := range items {
		_, err = tx.Exec(ctx, `
			INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)
		`, orderID, item.ProductID, item.Quantity)

		if err != nil {
			return nil, nil, err
		}
	}

	rows, err := tx.Query(ctx, `
		SELECT oi.product_id, p.title, p.price, oi.quantity
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		WHERE oi.order_id = $1
	`, orderID)

	if err != nil {
		return nil, nil, err
	}

	defer rows.Close()

	var orderItems []*orderdomain.OrderItem

	for rows.Next() {
		var productID int64
		var title string
		var price float64
		var quantity int

		if err := rows.Scan(&productID, &title, &price, &quantity); err != nil {
			return nil, nil, err
		}

		orderItems = append(orderItems, orderdomain.NewOrderItem(productID, title, price, quantity))
	}

	if err := rows.Err(); err != nil {
		return nil, nil, err

	}

	if err := tx.Commit(ctx); err != nil {
		return nil, nil, err
	}

	return orderdomain.NewOrder(orderID, userID, createdAt), orderItems, nil
}

func (r *PgxRepository) UpsertDailyPurchase(ctx context.Context, orderDate time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO daily_purchases (order_date, purchases)
		VALUES ($1, 1)
		ON CONFLICT (order_date) DO UPDATE
		SET purchases = daily_purchases.purchases + 1
	`, orderDate)

	return err
}

func (r *PgxRepository) GetOrderItems(ctx context.Context, orderID int64) ([]*orderdomain.OrderItem, error) {
	rows, err := r.pool.Query(ctx, `SELECT * FROM get_order_items_by_order_id($1)`, orderID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var items []*orderdomain.OrderItem

	for rows.Next() {
		var productID int64
		var title string
		var price float64
		var quantity int

		if err := rows.Scan(&productID, &title, &price, &quantity); err != nil {
			return nil, err
		}

		items = append(items, orderdomain.NewOrderItem(productID, title, price, quantity))
	}

	return items, rows.Err()
}

func (r *PgxRepository) GetTotalThisMonth(ctx context.Context) (float64, error) {
	var totalThisMonth float64

	err := r.pool.QueryRow(ctx, `
		SELECT SUM(p.price) from order_items oi
		JOIN products p ON oi.product_id = p.id
		JOIN orders o ON oi.order_id = o.id
		WHERE o.created_at >= date_trunc('month', CURRENT_DATE) 
			AND o.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
	`).Scan(&totalThisMonth)

	if err != nil {
		return 0, err
	}

	return totalThisMonth, err
}

func (r *PgxRepository) GetAverageCheck(ctx context.Context) (float64, error) {
	var averageCheck float64

	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(p.price * oi.quantity), 0) / NULLIF(COUNT(DISTINCT o.id), 0)
		FROM orders o
		JOIN order_items oi ON oi.order_id = o.id
		JOIN products p ON p.id = oi.product_id
	`).Scan(&averageCheck)

	if err != nil {
		return 0, err
	}

	return math.Round(averageCheck*100) / 100, err
}

func (r *PgxRepository) GetOrdersTrend(ctx context.Context) (*orderdomain.OrdersTrend, error) {
	var currentPeriod int
	var previousPeriod int

	err := r.pool.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) as current_period,
			COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '28 days' AND created_at < NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) as previous_period
		FROM orders
		WHERE created_at >= NOW() - INTERVAL '28 days'
	`).Scan(&currentPeriod, &previousPeriod)

	if err != nil {
		return nil, err
	}

	return orderdomain.NewOrdersTrend(
		currentPeriod,
		previousPeriod,
		growth.CalculateGrowth(float64(currentPeriod), float64(previousPeriod)),
	), err
}

func (r *PgxRepository) GetDailyStats(ctx context.Context, limit int, offset int) ([]*orderdomain.DailyStats, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT 
			o.created_at as "date", 
			COUNT(DISTINCT o.id) as "orders", 
			SUM(p.price) as "revenue"
		FROM order_items oi
		JOIN products p ON oi.product_id = p.id
		JOIN orders o ON oi.order_id = o.id
		GROUP BY o.created_at
		ORDER BY o.created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var dailyStats []*orderdomain.DailyStats

	for rows.Next() {
		var date time.Time
		var orders int
		var revenue float64

		if err := rows.Scan(&date, &orders, &revenue); err != nil {
			return nil, err
		}

		dailyStats = append(dailyStats, orderdomain.NewDailyStats(date, orders, revenue))
	}

	return dailyStats, rows.Err()
}
