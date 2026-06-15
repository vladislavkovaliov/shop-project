package user

import "time"

type DailyUserRegistration struct {
	count     int
	createdAt time.Time
}

func (d *DailyUserRegistration) CreatedAt() time.Time {
	return d.createdAt
}

func (d *DailyUserRegistration) Count() int {
	return d.count
}

func NewDailyUserRegistration(count int, createdAt time.Time) *DailyUserRegistration {
	return &DailyUserRegistration{
		count:     count,
		createdAt: createdAt,
	}
}
