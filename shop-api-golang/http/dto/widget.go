package dto

type TopCategoryResponse struct {
	Title   string  `json:"title"`
	Revenue float64 `json:"revenue"`
}

type WidgetStatsResponse struct {
	TotalCategories int                `json:"totalCategories"`
	TotalProducts   int                `json:"totalProducts"`
	TopCategory     TopCategoryResponse `json:"topCategory"`
}
