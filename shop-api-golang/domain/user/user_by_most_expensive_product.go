package user

type UserByMostExpensiveProduct struct {
	User
}

func NewUserByMostExpensiveProduct(id int64, name string, email string) *UserByMostExpensiveProduct {
	return &UserByMostExpensiveProduct{
		User: User{id: id, name: name, email: email},
	}
}
