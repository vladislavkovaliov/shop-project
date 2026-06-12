package dto

import "time"

type StatsOrderResponse struct {
	Total          int     `json:"total" example:"1" binding:"required"`
	TotalThisMonth float64 `json:"totalThisMonth" example:"4.200" binding:"required"`
	AverageCheck   float64 `json:"averageCheck" example:"1.300" binding:"required"`
}

type OrderResponse struct {
	ID        int64     `json:"id" example:"1" binding:"required"`
	UserID    int64     `json:"user_id" example:"1" binding:"required"`
	CreatedAt time.Time `json:"created_at" example:"2026-05-11 01:45:24.864701" binding:"required"`
}

type ListOrderResponse struct {
	Data  []OrderResponse `json:"data" binding:"required"`
	Total int             `json:"total" binding:"required"`
}

type DailyPurchases struct {
	OrderDate time.Time `json:"order_date" binding:"required"`
	Purchases int       `json:"purchases" binding:"required"`
}

type ListDailyPurchasesResponse struct {
	Data  []DailyPurchases `json:"data" binding:"required"`
	Total int              `json:"total" binding:"required"`
}

type CreateOrderItem struct {
	ProductID int64 `json:"product_id"`
	Quantity  int   `json:"quantity"`
}

type CreateOrderRequest struct {
	UserID int64             `json:"user_id" example:"1"`
	Items  []CreateOrderItem `json:"items"`
}

type OrderItemResponse struct {
	ProductID int64   `json:"product_id" binding:"required"`
	Title     string  `json:"title" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required"`
	Price     float64 `json:"price" binding:"required"`
}

type CreateOrderResponse struct {
	ID        int64               `json:"id" binding:"required"`
	UserID    int64               `json:"user_id" binding:"required"`
	CreatedAt time.Time           `json:"created_at" binding:"required"`
	Items     []OrderItemResponse `json:"items" binding:"required"`
}

type DailyStatResponse struct {
	Date    time.Time `json:"date" example:"2026-05-11 01:45:24.864701" binding:"required"`
	Orders  int       `json:"orders" example:"1" binding:"required"`
	Revenue float64   `json:"revenue" example:"120.00" binding:"required"`
}

type ListDailyStatResponse struct {
	Data  []DailyStatResponse `json:"data" binding:"required"`
	Total int                 `json:"total" binding:"required"`
}
