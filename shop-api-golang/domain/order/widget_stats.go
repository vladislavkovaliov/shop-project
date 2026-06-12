package order

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
