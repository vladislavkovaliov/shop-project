package widget

type TopCategory struct {
	title   string
	revenue float64
}

func NewTopCategory(title string, revenue float64) *TopCategory {
	return &TopCategory{title: title, revenue: revenue}
}

func (t *TopCategory) Title() string {
	return t.title
}

func (t *TopCategory) Revenue() float64 {
	return t.revenue
}

type WidgetStats struct {
	totalCategories int
	totalProducts   int
	topCategory     *TopCategory
}

func NewWidgetStats(totalCategories int, totalProducts int, topCategory *TopCategory) *WidgetStats {
	return &WidgetStats{
		totalCategories: totalCategories,
		totalProducts:   totalProducts,
		topCategory:     topCategory,
	}
}

func (s *WidgetStats) TotalCategories() int {
	return s.totalCategories
}

func (s *WidgetStats) TotalProducts() int {
	return s.totalProducts
}

func (s *WidgetStats) TopCategory() *TopCategory {
	return s.topCategory
}
