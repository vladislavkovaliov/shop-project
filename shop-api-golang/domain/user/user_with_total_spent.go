package user

type UserWithTotalSpent struct {
	User
	totalSpent float64
}

func (u *UserWithTotalSpent) TotalSpent() float64 {
	return u.totalSpent
}

func NewUserWithTotalSpent(id int64, name string, email string, totalSpent float64) *UserWithTotalSpent {
	return &UserWithTotalSpent{
		User:       User{id: id, name: name, email: email},
		totalSpent: totalSpent,
	}
}
