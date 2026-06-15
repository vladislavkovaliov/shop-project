package user

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

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

func (r *PgxRepository) Search(ctx context.Context, field string, value string) ([]*userdomain.User, error) {
	col, ok := allowedFields[field]

	if !ok {
		return nil, fmt.Errorf("invalid search field: %s", field)
	}

	query := fmt.Sprintf("SELECT id, name, email FROM users WHERE %s ILIKE '%%' || $1 || '%%'", col)

	rows, err := r.pool.Query(ctx, query, value)

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
	rows, err := r.pool.Query(ctx, `
		SELECT 
			o.user_id,
			u.name,
			u.email,
			SUM(oi.quantity * p.price) AS total_spent
		FROM orders o
		JOIN order_items oi on o.id = oi.order_id
		JOIN products p ON oi.product_id = p.id
		JOIN users u ON u.id = o.user_id
		GROUP BY o.user_id, u.name, u.email
		ORDER BY total_spent DESC
		LIMIT 3
	`)

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
