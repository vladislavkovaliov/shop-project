package category

import "shop-api/domain/growth"

type CategoryRevenue struct {
	category string
	products int
	revenue  float64
	orders   int
	growth   growth.Growth
}

func (s *CategoryRevenue) Category() string {
	return s.category
}

func (s *CategoryRevenue) Products() int {
	return s.products
}

func (s *CategoryRevenue) Revenue() float64 {
	return s.revenue
}

func (s *CategoryRevenue) Orders() int {
	return s.orders
}

func (s *CategoryRevenue) Growth() growth.Growth {
	return s.growth
}

func NewCategoryRevenue(category string, products int, revenue float64, orders int, growth growth.Growth) *CategoryRevenue {
	return &CategoryRevenue{category: category, products: products, revenue: revenue, orders: orders, growth: growth}
}
