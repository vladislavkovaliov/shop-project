package user

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"shop-api/domain/growth"
	userdomain "shop-api/domain/user"
)

var allowedFields = map[string]string{
	"email": "email",
	"name":  "name",
}

type PgxRepository struct {
	pool *pgxpool.Pool
}

func NewPgxRepository(pool *pgxpool.Pool) *PgxRepository {
	return &PgxRepository{pool: pool}
}

func (r *PgxRepository) Count(ctx context.Context) (int, error) {
	var total int

	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&total)

	return total, err
}

func (r *PgxRepository) ListCursor(ctx context.Context, cursor int, limit int) ([]*userdomain.User, error) {
	var query string
	var args []any

	if cursor > 0 {
		query = "SELECT id, name, email FROM users WHERE id > $1 ORDER BY id ASC LIMIT $2"
		args = []any{cursor, limit}
	} else {
		query = "SELECT id, name, email FROM users ORDER BY id ASC LIMIT $1"
		args = []any{limit}
	}

	rows, err := r.pool.Query(ctx, query, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []*userdomain.User

	for rows.Next() {
		var id int64
		var name string
		var email string

		if err := rows.Scan(&id, &name, &email); err != nil {
			return nil, err
		}

		users = append(users, userdomain.NewUser(id, name, email))
	}

	return users, rows.Err()
}

func (r *PgxRepository) List(ctx context.Context, limit int, offset int) ([]*userdomain.User, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, name, email FROM users LIMIT $1 OFFSET $2", limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []*userdomain.User

	for rows.Next() {
		var id int64
		var name string
		var email string

		if err := rows.Scan(&id, &name, &email); err != nil {
			return nil, err
		}

		users = append(users, userdomain.NewUser(id, name, email))
	}

	return users, rows.Err()
}

func (r *PgxRepository) ListTop3Users(ctx context.Context) ([]*userdomain.UserWithTotalSpent, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, name, email, total_spent FROM user_total_spent LIMIT 3`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var top3Users []*userdomain.UserWithTotalSpent

	for rows.Next() {
		var id int64
		var name string
		var email string
		var totalSpent float64

		if err := rows.Scan(&id, &name, &email, &totalSpent); err != nil {
			return nil, err
		}

		top3Users = append(top3Users, userdomain.NewUserWithTotalSpent(id, name, email, totalSpent))
	}

	return top3Users, rows.Err()
}

func (r *PgxRepository) ListUserByMostExpensiveProduct(ctx context.Context) ([]*userdomain.UserByMostExpensiveProduct, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT DISTINCT u.id, u.email, u.name FROM users u
		JOIN orders o ON o.user_id = u.id
		JOIN order_items oi ON oi.order_id = o.id
		WHERE oi.product_id = (
			SELECT id FROM products
			ORDER BY price DESC
			LIMIT 1
		);
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var userByMostExpensiveProducts []*userdomain.UserByMostExpensiveProduct

	for rows.Next() {
		var id int64
		var name string
		var email string

		if err := rows.Scan(&id, &name, &email); err != nil {
			return nil, err
		}

		userByMostExpensiveProducts = append(
			userByMostExpensiveProducts,
			userdomain.NewUserByMostExpensiveProduct(id, name, email),
		)
	}

	return userByMostExpensiveProducts, rows.Err()

}

func (r *PgxRepository) ListDailyUserRegistration(ctx context.Context) ([]*userdomain.DailyUserRegistration, error) {
	rows, err := r.pool.Query(ctx, "SELECT created_at, count FROM daily_user_registrations ORDER BY created_at DESC LIMIT 1")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var result []*userdomain.DailyUserRegistration

	for rows.Next() {
		var createdAt time.Time
		var count int

		if err := rows.Scan(&createdAt, &count); err != nil {
			return nil, err
		}

		result = append(
			result,
			userdomain.NewDailyUserRegistration(count, createdAt),
		)
	}

	return result, rows.Err()
}

func (r *PgxRepository) Search(ctx context.Context, field string, value string) ([]*userdomain.User, error) {
	_, ok := allowedFields[field]

	if !ok {
		return nil, fmt.Errorf("invalid search field: %s", field)
	}

	rows, err := r.pool.Query(ctx, "SELECT id, name, email FROM search_users_by_field($1, $2)", field, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []*userdomain.User

	for rows.Next() {
		var id int64
		var name string
		var email string

		if err := rows.Scan(&id, &name, &email); err != nil {
			return nil, err
		}

		users = append(users, userdomain.NewUser(id, name, email))
	}

	return users, rows.Err()
}

func (r *PgxRepository) Create(ctx context.Context, name string, email string) (*userdomain.User, error) {
	var userID int64

	err := r.pool.QueryRow(ctx, "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id", name, email).Scan(&userID)

	if err != nil {
		return nil, err
	}

	return userdomain.NewUser(userID, name, email), err
}

func (r *PgxRepository) UpsertDailyUserRegistration(ctx context.Context, date time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO daily_user_registrations (created_at, count) VALUES ($1, 1)
		ON CONFLICT (created_at) DO UPDATE SET count = daily_user_registrations.count + 1
	`, date)

	return err
}

func (r *PgxRepository) GetUserRegistrationTrend(ctx context.Context) (*userdomain.UserRegistrationTrend, error) {
	var currentPeriod int
	var previousPeriod int

	err := r.pool.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) as current_period,
			COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '28 days' AND created_at < NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) as previous_period
		FROM users
		WHERE created_at >= NOW() - INTERVAL '28 days'
	`).Scan(&currentPeriod, &previousPeriod)

	if err != nil {
		return nil, err
	}

	return userdomain.NewUserRegistrationTrend(
		currentPeriod,
		previousPeriod,
		growth.CalculateGrowth(float64(currentPeriod), float64(previousPeriod)),
	), err
}
