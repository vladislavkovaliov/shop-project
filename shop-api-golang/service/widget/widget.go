package widget

import (
	"context"

	widgetdomain "shop-api/domain/widget"
)

type Service struct {
	repo widgetdomain.Repository
}

func New(repo widgetdomain.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetWidgetStats(ctx context.Context) (*widgetdomain.WidgetStats, error) {
	return s.repo.GetWidgetStats(ctx)
}
