package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"shop-api/http/dto"
	categoryservice "shop-api/service/category"
	widgetservice "shop-api/service/widget"
)

type CategoryHandler struct {
	service       *categoryservice.Service
	widgetService *widgetservice.Service
}

func NewCategoryHandler(service *categoryservice.Service, widgetService *widgetservice.Service) *CategoryHandler {
	return &CategoryHandler{service: service, widgetService: widgetService}
}

// ListCategories godoc
//
//	@Summary		List all categories
//	@Description	Returns all categories from the database
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	dto.ListCategoryResponse
//	@Router			/categories [get]
//
//	@Param			limit	query	int	false	"Number of categories to return (default 10)"
//	@Param			offset	query	int	false	"Number of categories to skip (default 0)"
func (h *CategoryHandler) ListCategory(c *gin.Context) {
	defaultLimit := 10
	defaultOffset := 0

	if limit, err := strconv.Atoi(c.Query("limit")); err == nil && limit > 0 {
		defaultLimit = limit
	}

	if offset, err := strconv.Atoi(c.Query("offset")); err == nil && offset >= 0 {
		defaultOffset = offset
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	categories, total, err := h.service.List(ctx, defaultLimit, defaultOffset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.CategoryResponse, 0, len(categories))

	for _, p := range categories {
		res = append(res, dto.CategoryResponse{
			ID:        p.ID(),
			Title:     p.Title(),
			Slug:      p.Slug(),
			CreatedAt: p.CreatedAt(),
		})
	}

	c.JSON(http.StatusOK, dto.ListCategoryResponse{
		Data:  res,
		Total: total,
	})
}

// ListCategoryAveragePrice godoc
//
//	@Summary		Get average price per category
//	@Description	Returns average product price grouped by category
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	dto.ListCategoryAvaragePriceResponse
//	@Router			/categories/avarage-price [get]
func (h *CategoryHandler) ListCategoryAvaragePrice(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	categoryAveragePrices, err := h.service.ListCategoryAvaragePrice(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.CategoryAveragePrice, 0, len(categoryAveragePrices))

	for _, c := range categoryAveragePrices {
		res = append(res, dto.CategoryAveragePrice{
			Category: c.Category(),
			AvgPrice: c.AveragePrice(),
		})
	}

	c.JSON(http.StatusOK, dto.ListCategoryAvaragePriceResponse{
		Data:  res,
		Total: len(categoryAveragePrices),
	})
}

// ListCategoryRevenue godoc
//
//	@Summary		Get category revenue stats
//	@Description	Returns revenue, orders, products and growth per category
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	dto.ListCategoryRevenueResponse
//	@Router			/categories/revenue [get]
//
//	@Param			limit	query	int	false	"Number of categories to return (default 10)"
//	@Param			offset	query	int	false	"Number of categories to skip (default 0)"
func (h *CategoryHandler) ListCategoryRevenue(c *gin.Context) {
	defaultLimit := 10
	defaultOffset := 0

	if limit, err := strconv.Atoi(c.Query("limit")); err == nil && limit > 0 {
		defaultLimit = limit
	}

	if offset, err := strconv.Atoi(c.Query("offset")); err == nil && offset >= 0 {
		defaultOffset = offset
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	stats, total, err := h.service.ListCategoryRevenue(ctx, defaultLimit, defaultOffset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.CategoryRevenueResponse, 0, len(stats))

	for _, s := range stats {
		res = append(res, dto.CategoryRevenueResponse{
			Category: s.Category(),
			Products: s.Products(),
			Revenue:  s.Revenue(),
			Orders:   s.Orders(),
			Growth: dto.GrowthResponse{
				Value: s.Growth().Value(),
				Sign:  s.Growth().Sign(),
			},
		})
	}

	c.JSON(http.StatusOK, dto.ListCategoryRevenueResponse{
		Data:  res,
		Total: total,
	})
}

// GetCategoryStats godoc
//
//	@Summary		Get category stats for widgets
//	@Description	Returns total categories, total products, and top category by revenue
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	dto.WidgetStatsResponse
//	@Router			/categories/stats [get]
func (h *CategoryHandler) GetCategoryStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	stats, err := h.widgetService.GetWidgetStats(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, dto.WidgetStatsResponse{
		TotalCategories: stats.TotalCategories(),
		TotalProducts:   stats.TotalProducts(),
		TopCategory: dto.TopCategoryResponse{
			Title:   stats.TopCategory().Title(),
			Revenue: stats.TopCategory().Revenue(),
		},
	})
}
