package order

import "shop-api/domain/growth"

type OrdersTrend struct {
	currentPeriod  int
	previousPeriod int
	growth         growth.Growth
}

func (t *OrdersTrend) CurrentPeriod() int {
	return t.currentPeriod
}

func (t *OrdersTrend) PreviousPeriod() int {
	return t.previousPeriod
}

func (t *OrdersTrend) Growth() growth.Growth {
	return t.growth
}

func NewOrdersTrend(currentPeriod int, previousPeriod int, growth growth.Growth) *OrdersTrend {
	return &OrdersTrend{
		currentPeriod:  currentPeriod,
		previousPeriod: previousPeriod,
		growth:         growth,
	}
}
