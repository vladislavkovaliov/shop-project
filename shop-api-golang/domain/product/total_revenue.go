package product

import "shop-api/domain/growth"

type TotalRevenue struct {
	title   string
	revenue float64
	growth  growth.Growth
}

func (t *TotalRevenue) Title() string {
	return t.title
}

func (t *TotalRevenue) Revenue() float64 {
	return t.revenue
}

func (t *TotalRevenue) Growth() growth.Growth {
	return t.growth
}

func NewTotalRevenue(title string, revenue float64, growth growth.Growth) *TotalRevenue {
	return &TotalRevenue{title: title, revenue: revenue, growth: growth}
}
