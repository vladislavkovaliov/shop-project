package order

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
