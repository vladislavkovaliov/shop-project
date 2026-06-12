package widget

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	widgetdomain "shop-api/domain/widget"
)

type PgxRepository struct {
	pool *pgxpool.Pool
}

func NewPgxRepository(pool *pgxpool.Pool) *PgxRepository {
	return &PgxRepository{pool: pool}
}

func (r *PgxRepository) GetWidgetStats(ctx context.Context) (*widgetdomain.WidgetStats, error) {
	var totalCategories, totalProducts int
	var topCategoryTitle string
	var topCategoryRevenue float64

	err := r.pool.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM categories) AS total_categories,
			(SELECT COUNT(*) FROM products) AS total_products,
			top.title,
			top.revenue
		FROM (
			SELECT
				c.title,
				COALESCE(SUM(oi.quantity * p.price), 0) AS revenue
			FROM categories c
			LEFT JOIN product_categories pc ON pc.category_id = c.id
			LEFT JOIN products p ON p.id = pc.product_id
			LEFT JOIN order_items oi ON oi.product_id = p.id
			LEFT JOIN orders o ON o.id = oi.order_id
			GROUP BY c.id, c.title
			ORDER BY revenue DESC
			LIMIT 1
		) top
	`).Scan(&totalCategories, &totalProducts, &topCategoryTitle, &topCategoryRevenue)

	if err != nil {
		return nil, err
	}

	topCategory := widgetdomain.NewTopCategory(topCategoryTitle, topCategoryRevenue)

	return widgetdomain.NewWidgetStats(totalCategories, totalProducts, topCategory), nil
}
