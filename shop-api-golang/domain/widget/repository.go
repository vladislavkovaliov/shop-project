package widget

import "context"

type Repository interface {
	GetWidgetStats(ctx context.Context) (*WidgetStats, error)
}
