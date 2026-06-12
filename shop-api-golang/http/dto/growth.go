package dto

type GrowthResponse struct {
	Value float64 `json:"value" binding:"required"`
	Sign  string  `json:"sign" binding:"required"`
}
