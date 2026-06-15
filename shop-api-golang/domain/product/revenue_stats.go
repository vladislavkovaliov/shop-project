package product

type RevenueStats struct {
	totalRevenue      float64
	averageOrderValue float64
	totalProductsSold int64
}

func (r *RevenueStats) TotalRevenue() float64 {
	return r.totalRevenue
}

func (r *RevenueStats) AverageOrderValue() float64 {
	return r.averageOrderValue
}

func (r *RevenueStats) TotalProductsSold() int64 {
	return r.totalProductsSold
}

func NewRevenueStats(totalRevenue float64, averageOrderValue float64, totalProductsSold int64) *RevenueStats {
	return &RevenueStats{totalRevenue: totalRevenue, averageOrderValue: averageOrderValue, totalProductsSold: totalProductsSold}
}
