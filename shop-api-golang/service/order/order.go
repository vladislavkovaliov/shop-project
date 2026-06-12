package order

import (
	"context"
	orderdomain "shop-api/domain/order"
	"shop-api/internal/events"
)

type Service struct {
	repo     orderdomain.Repository
	producer *events.Producer
}

func New(repo orderdomain.Repository, producer *events.Producer) *Service {
	return &Service{repo: repo, producer: producer}
}

func (s *Service) Count(ctx context.Context) (int, error) {
	total, err := s.repo.Count(ctx)

	if err != nil {
		return 0, err
	}

	return total, err
}

func (s *Service) GetTotalThisMonth(ctx context.Context) (float64, error) {
	totalThisMonth, err := s.repo.GetTotalThisMonth(ctx)

	if err != nil {
		return 0, err
	}

	return totalThisMonth, err
}

func (s *Service) GetAverageCheck(ctx context.Context) (float64, error) {
	averageCheck, err := s.repo.GetAverageCheck(ctx)

	if err != nil {
		return 0, err
	}

	return averageCheck, err
}

func (s *Service) List(ctx context.Context, limit int, offset int) ([]*orderdomain.Order, int, error) {
	orders, err := s.repo.List(ctx, limit, offset)

	if err != nil {
		return nil, 0, err
	}

	total, err := s.repo.Count(ctx)

	if err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *Service) ListDailyPurchases(ctx context.Context) ([]*orderdomain.DailyPurchases, error) {
	dailyPurchases, err := s.repo.ListDailyPurchases(ctx)

	if err != nil {
		return nil, err
	}

	return dailyPurchases, err
}

func (s *Service) Create(ctx context.Context, userID int64, items []orderdomain.CreateItem) (*orderdomain.Order, []*orderdomain.OrderItem, error) {
	order, orderItems, err := s.repo.Create(ctx, userID, items)

	if err != nil {
		return nil, nil, err
	}

	if err := s.producer.PublishOrderCreated(ctx, events.OrderCreated{
		OrderID:   order.ID(),
		UserID:    order.UserID(),
		CreatedAt: order.CreatedAt(),
	}); err != nil {
		return nil, nil, err
	}

	return order, orderItems, nil
}

func (s *Service) GetOrderItems(ctx context.Context, orderID int64) ([]*orderdomain.OrderItem, error) {
	return s.repo.GetOrderItems(ctx, orderID)
}

func (s *Service) CountDailyStats(ctx context.Context) (int, error) {
	total, err := s.repo.CountDailyStats(ctx)

	if err != nil {
		return 0, err
	}

	return total, err
}

func (s *Service) GetDailyStats(ctx context.Context, limit int, offset int) ([]*orderdomain.DailyStats, int, error) {
	dailyStats, err := s.repo.GetDailyStats(ctx, limit, offset)

	if err != nil {
		return nil, 0, err
	}

	total, err := s.repo.CountDailyStats(ctx)

	if err != nil {
		return nil, 0, err
	}

	return dailyStats, total, err
}
