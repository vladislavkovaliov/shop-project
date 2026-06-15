package dto

import "time"

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

type UserWithTotalSpent struct {
	ID         int64   `json:"id" example:"1" binding:"required"`
	Name       string  `json:"name" example:"username" binding:"required"`
	Email      string  `json:"email" example:"text@gmail.com" binding:"required"`
	TotalSpent float64 `json:"totalSpent" example:"123.123" binding:"required"`
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

type ListUserWithTotalResponse struct {
	Data  []UserWithTotalSpent `json:"data" binding:"required"`
	Total int                  `json:"total" binding:"required"`
}

type ListUserByMostExpensiveProductResponse struct {
	Data  []UserByMostExpensiveProduct `json:"data" binding:"required"`
	Total int                          `json:"total" binding:"required"`
}

type CreateUserRequest struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required"`
}

type DailyUserRegistrationResponse struct {
	CreatedAt time.Time `json:"createdAt" binding:"required"`
	Count     int       `json:"count" binding:"required"`
}

type ListDailyUserRegistrationResponse struct {
	Data []DailyUserRegistrationResponse `json:"data" binding:"required"`
}
