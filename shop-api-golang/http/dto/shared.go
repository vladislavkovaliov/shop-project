package dto

type CountResponse struct {
	Count int `json:"count" example:"1" binding:"required"`
}
