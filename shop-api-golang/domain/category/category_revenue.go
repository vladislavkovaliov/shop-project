package category

type Growth struct {
	value float64
	sign  string
}

func (g Growth) Value() float64 {
	return g.value
}

func (g Growth) Sign() string {
	return g.sign
}

func NewGrowth(value float64, sign string) Growth {
	return Growth{value: value, sign: sign}
}

type CategoryRevenue struct {
	category string
	products int
	revenue  float64
	orders   int
	growth   Growth
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

func (s *CategoryRevenue) Growth() Growth {
	return s.growth
}

func NewCategoryRevenue(category string, products int, revenue float64, orders int, growth Growth) *CategoryRevenue {
	return &CategoryRevenue{category: category, products: products, revenue: revenue, orders: orders, growth: growth}
}
