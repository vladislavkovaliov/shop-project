package dto

type UserResponse struct {
	ID    int64  `json:"id" example:"1" binding:"required"`
	Name  string `json:"name" example:"username" binding:"required"`
	Email string `json:"email" example:"text@gmail.com" binding:"required"`
}

type UserWithPurchases struct {
	ID        int64  `json:"id" example:"1" binding:"required"`
	Name      string `json:"name" example:"username" binding:"required"`
	Email     string `json:"email" example:"text@gmail.com" binding:"required"`
	Purchases int    `json:"purchases" example:"1" binding:"required"`
}

type UserByMostExpensiveProduct struct {
	ID    int64  `json:"id" example:"1" binding:"required"`
	Name  string `json:"name" example:"username" binding:"required"`
	Email string `json:"email" example:"text@gmail.com" binding:"required"`
}

type ListUserResponse struct {
	Data  []UserResponse `json:"data" binding:"required"`
	Total int            `json:"total" binding:"required"`
}

type CursorUserResponse struct {
	Users      []UserResponse `json:"users" binding:"required"`
	NextCursor int64          `json:"next_cursor" binding:"required"`
}

type ListUserWithPurchasesResponse struct {
	Data  []UserWithPurchases `json:"data" binding:"required"`
	Total int                 `json:"total" binding:"required"`
}

type ListUserByMostExpensiveProductResponse struct {
	Data  []UserByMostExpensiveProduct `json:"data" binding:"required"`
	Total int                          `json:"total" binding:"required"`
}
