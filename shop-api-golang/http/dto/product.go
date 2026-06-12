package dto

type ProductResponse struct {
	ID    int64   `json:"id" example:"1" binding:"required"`
	Title string  `json:"title" example:"Keyboard" binding:"required"`
	Price float64 `json:"price" example:"150.00" binding:"required"`
}

type ListProductResponse struct {
	Data  []ProductResponse `json:"data" binding:"required"`
	Total int               `json:"total" binding:"required"`
}

type CreateProductRequest struct {
	Title string  `json:"title" example:"Keyboard"`
	Price float64 `json:"price" example:"150.00"`
}

type CursorProductsResponse struct {
	Products   []ProductResponse `json:"products" binding:"required"`
	NextCursor int64             `json:"next_cursor" binding:"required"`
}

type TotalRevenueResponse struct {
	Title   string  `json:"title" binding:"required"`
	Revenue float64 `json:"revenue" binding:"required"`
}

type ListTotalRevenueResponse struct {
	Data  []TotalRevenueResponse `json:"data" binding:"required"`
	Total int                    `json:"total" binding:"required"`
}
