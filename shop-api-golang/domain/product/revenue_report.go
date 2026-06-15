package product

import "shop-api/domain/growth"

type RevenueReport struct {
	title   string
	revenue float64
	growth  growth.Growth
}

func (t *RevenueReport) Title() string {
	return t.title
}

func (t *RevenueReport) Revenue() float64 {
	return t.revenue
}

func (t *RevenueReport) Growth() growth.Growth {
	return t.growth
}

func NewRevenueReport(title string, revenue float64, growth growth.Growth) *RevenueReport {
	return &RevenueReport{title: title, revenue: revenue, growth: growth}
}
