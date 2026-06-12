package order

import (
	"context"
	"time"
)

type CreateItem struct {
	ProductID int64
	Quantity  int
}

type Repository interface {
	Count(ctx context.Context) (int, error)
	CountDailyStats(ctx context.Context) (int, error)
	List(ctx context.Context, limit int, offset int) ([]*Order, error)
	ListDailyPurchases(ctx context.Context) ([]*DailyPurchases, error)
	Create(ctx context.Context, userID int64, items []CreateItem) (*Order, []*OrderItem, error)
	UpsertDailyPurchase(ctx context.Context, orderDate time.Time) error
	GetOrderItems(ctx context.Context, orderID int64) ([]*OrderItem, error)
	GetTotalThisMonth(ctx context.Context) (float64, error)
	GetAverageCheck(ctx context.Context) (float64, error)
	GetDailyStats(ctx context.Context, limit int, offset int) ([]*DailyStats, error)
}
