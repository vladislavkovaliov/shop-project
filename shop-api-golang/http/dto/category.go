package dto

import "time"

type CategoryResponse struct {
	ID        int64     `json:"id" example:"1" binding:"required"`
	Title     string    `json:"title" example:"Keyboard" binding:"required"`
	Slug      string    `json:"slug" example:"keyboard" binding:"required"`
	CreatedAt time.Time `json:"created_at" example:"2025-01-01T00:00:00Z" binding:"required"`
}

type CategoryAveragePrice struct {
	Category string  `json:"category" binding:"required"`
	AvgPrice float64 `json:"avg_price" binding:"required"`
}

type ListCategoryResponse struct {
	Data  []CategoryResponse `json:"data" binding:"required"`
	Total int                `json:"total" binding:"required"`
}

type ListCategoryAvaragePriceResponse struct {
	Data  []CategoryAveragePrice `json:"data" binding:"required"`
	Total int                    `json:"total" binding:"required"`
}

type GrowthResponse struct {
	Value float64 `json:"value" binding:"required"`
	Sign  string  `json:"sign" binding:"required"`
}

type CategoryRevenueResponse struct {
	Category string         `json:"category" binding:"required"`
	Products int            `json:"products" binding:"required"`
	Revenue  float64        `json:"revenue" binding:"required"`
	Orders   int            `json:"orders" binding:"required"`
	Growth   GrowthResponse `json:"growth" binding:"required"`
}

type ListCategoryRevenueResponse struct {
	Data  []CategoryRevenueResponse `json:"data" binding:"required"`
	Total int                       `json:"total" binding:"required"`
}
