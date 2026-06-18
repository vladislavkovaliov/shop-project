package user

import (
	"context"
	"time"
)

type Repository interface {
	Count(ctx context.Context) (int, error)
	ListCursor(ctx context.Context, cursor int, limit int) ([]*User, error)
	List(ctx context.Context, limit int, offset int) ([]*User, error)
	Search(ctx context.Context, field string, value string) ([]*User, error)
	ListTop3Users(ctx context.Context) ([]*UserWithTotalSpent, error)
	ListUserByMostExpensiveProduct(ctx context.Context) ([]*UserByMostExpensiveProduct, error)
	ListDailyUserRegistration(ctx context.Context) ([]*DailyUserRegistration, error)
	UpsertDailyUserRegistration(ctx context.Context, date time.Time) error
	Create(ctx context.Context, name string, email string) (*User, error)
	GetUserRegistrationTrend(ctx context.Context) (*UserRegistrationTrend, error)
}
