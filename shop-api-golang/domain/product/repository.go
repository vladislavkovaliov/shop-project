package product

import "context"

type Repository interface {
	Count(ctx context.Context) (int, error)
	ListCursor(ctx context.Context, cursor int, limit int) ([]*Product, error)
	List(ctx context.Context, limit int, offset int) ([]*Product, error)
	ListRevenueReport(ctx context.Context, limit int, offset int) ([]*RevenueReport, error)
	Create(ctx context.Context, title string, price float64, categoryID *int64) (*Product, error)
}
