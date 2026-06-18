package user

import "shop-api/domain/growth"

type UserRegistrationTrend struct {
	currentPeriod  int
	previousPeriod int
	growth         growth.Growth
}

func (u *UserRegistrationTrend) CurrentPeriod() int {
	return u.currentPeriod
}

func (u *UserRegistrationTrend) PreviousPeriod() int {
	return u.previousPeriod
}

func (u *UserRegistrationTrend) Growth() growth.Growth {
	return u.growth
}

func NewUserRegistrationTrend(currentPeriod int, previousPeriod int, growth growth.Growth) *UserRegistrationTrend {
	return &UserRegistrationTrend{
		currentPeriod:  currentPeriod,
		previousPeriod: previousPeriod,
		growth:         growth,
	}
}
