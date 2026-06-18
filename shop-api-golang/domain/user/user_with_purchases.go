package user

type UserWithPurchases struct {
	User
	purchases int
}

func (u *UserWithPurchases) Purchases() int {
	return u.purchases
}

func NewUserWithPurchases(id int64, name string, email string, purchases int) *UserWithPurchases {
	return &UserWithPurchases{
		User:      User{id: id, name: name, email: email},
		purchases: purchases,
	}
}
