package growth

import "math"

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

func CalculateGrowth(recent, previous float64) Growth {
	if previous == 0 {
		return NewGrowth(0, "+")
	}

	growth := ((recent - previous) / previous) * 100

	sign := "+"

	if growth < 0 {
		sign = "-"
		growth = -growth
	}

	return NewGrowth(math.Round(growth*10)/10, sign)
}
