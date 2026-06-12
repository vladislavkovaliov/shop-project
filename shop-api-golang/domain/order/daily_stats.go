package order

import "time"

type DailyStats struct {
	date    time.Time
	orders  int
	revenue float64
}

func (d *DailyStats) Date() time.Time {
	return d.date
}

func (d *DailyStats) Orders() int {
	return d.orders
}

func (d *DailyStats) Revenue() float64 {
	return d.revenue
}

func NewDailyStats(date time.Time, orders int, revenue float64) *DailyStats {
	return &DailyStats{date: date, orders: orders, revenue: revenue}
}
