package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	orderdomain "shop-api/domain/order"
	"shop-api/http/dto"
	orderservice "shop-api/service/order"
)

type OrderHandler struct {
	service *orderservice.Service
}

func NewOrderHandler(service *orderservice.Service) *OrderHandler {
	return &OrderHandler{service: service}
}

// CountOrders godoc
//
//	@Summary		Count all orders
//	@Description	Returns count orders from the database
//	@Tags			orders
//	@Produce		json
//	@Success		200	{object}	dto.CountResponse
//	@Router			/orders/count [get]
func (h *OrderHandler) CountOrders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	total, err := h.service.Count(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, dto.CountResponse{
		Count: total,
	})
}

// StatsOrder godoc
//
//	@Summary		Statitstics all orders
//	@Description	Returns statistics orders from the database
//	@Tags			orders
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	dto.StatsOrderResponse
//	@Router			/orders/stats [get]
func (h *OrderHandler) StatsOrder(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	total, err := h.service.Count(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	totalThisMonth, err := h.service.GetTotalThisMonth(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	averageCheck, err := h.service.GetAverageCheck(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, dto.StatsOrderResponse{
		Total:          total,
		TotalThisMonth: totalThisMonth,
		AverageCheck:   averageCheck,
	})
}

// ListOrders godoc
//
//	@Summary		List all orders
//	@Description	Returns all orders from the database
//	@Tags			orders
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	dto.ListOrderResponse
//	@Router			/orders [get]
//
//	@Param			limit	query	int	false	"Number of products to return (default 10)"
//	@Param			offset	query	int	false	"Number of products to skip (default 0)"
func (h *OrderHandler) ListOrder(c *gin.Context) {
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

	orders, total, err := h.service.List(ctx, defaultLimit, defaultOffset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.OrderResponse, 0, len(orders))

	for _, p := range orders {
		res = append(res, dto.OrderResponse{
			ID:        p.ID(),
			UserID:    p.UserID(),
			CreatedAt: p.CreatedAt(),
		})
	}

	c.JSON(http.StatusOK, dto.ListOrderResponse{
		Data:  res,
		Total: total,
	})
}

// ListDailyPurchases godoc
//
//	@Summary		List all daily purchases
//	@Description	Returns all orders from the database
//	@Tags			orders
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	dto.ListDailyPurchasesResponse
//	@Router			/orders/daily-purchases [get]
func (h *OrderHandler) ListDailyPurchases(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	dailyPurchases, err := h.service.ListDailyPurchases(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.DailyPurchases, 0, len(dailyPurchases))

	for _, p := range dailyPurchases {
		res = append(res, dto.DailyPurchases{
			OrderDate: p.OrderDate(),
			Purchases: p.Purchases(),
		})
	}

	c.JSON(http.StatusOK, dto.ListDailyPurchasesResponse{
		Data:  res,
		Total: len(dailyPurchases),
	})
}

// CreateOrder godoc
//
//	@Summary		Create a new order
//	@Description	Creates an order and publishes order.created event to Kafka
//	@Tags			orders
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			body	body	dto.CreateOrderRequest	true	"Order data"
//	@Success		201		{object}	dto.CreateOrderResponse
//	@Failure		400		{object}	map[string]string
//	@Router			/orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req dto.CreateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return
	}

	items := make([]orderdomain.CreateItem, len(req.Items))

	for i, item := range req.Items {
		items[i] = orderdomain.CreateItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		}
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	order, orderItems, err := h.service.Create(ctx, req.UserID, items)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})

		return
	}

	resItems := make([]dto.OrderItemResponse, len(orderItems))

	for i, item := range orderItems {
		resItems[i] = dto.OrderItemResponse{
			ProductID: item.ProductID(),
			Title:     item.Title(),
			Quantity:  item.Quantity(),
			Price:     item.Price(),
		}
	}

	c.JSON(http.StatusCreated, dto.CreateOrderResponse{
		ID:        order.ID(),
		UserID:    order.UserID(),
		CreatedAt: order.CreatedAt(),
		Items:     resItems,
	})
}

// GetOrderItems godoc
//
//	@Summary		Get order items
//	@Description	Returns all items for a given order
//	@Tags			orders
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}	dto.OrderItemResponse
//	@Router			/orders/{orderID}/items [get]
//
//	@Param			orderID	path	int	true	"Order ID"
func (h *OrderHandler) GetOrderItems(c *gin.Context) {
	orderID, err := strconv.ParseInt(c.Param("orderID"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	orderItems, err := h.service.GetOrderItems(ctx, orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.OrderItemResponse, len(orderItems))

	for i, item := range orderItems {
		res[i] = dto.OrderItemResponse{
			ProductID: item.ProductID(),
			Title:     item.Title(),
			Quantity:  item.Quantity(),
			Price:     item.Price(),
		}
	}

	c.JSON(http.StatusOK, res)
}

// GetOrdersTrend godoc
//
//	@Summary		Get orders trend
//	@Description	Returns orders trend
//	@Tags			orders
//	@Produce		json
//	@Success		200	{object}	dto.OrdersTrendResponse
//	@Router			/orders/trend [get]
func (h *OrderHandler) GetOrdersTrend(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)

	defer cancel()

	ordersTrend, err := h.service.GetOrdersTrend(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, dto.OrdersTrendResponse{
		CurrentPeriod:  ordersTrend.CurrentPeriod(),
		PreviousPeriod: ordersTrend.PreviousPeriod(),
		Growth: dto.GrowthResponse{
			Value: ordersTrend.Growth().Value(),
			Sign:  ordersTrend.Growth().Sign(),
		},
	})
}

// GetDailyStats godoc
//
//	@Summary		List daily stats
//	@Description	Returns daily stats from the database
//	@Tags			orders
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	dto.ListDailyStatResponse
//	@Router			/orders/daily-stats [get]
//
//	@Param			limit	query	int	false	"Number of products to return (default 10)"
//	@Param			offset	query	int	false	"Number of products to skip (default 0)"
func (h *OrderHandler) GetDailyStats(c *gin.Context) {
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

	dailyStats, total, err := h.service.GetDailyStats(ctx, defaultLimit, defaultOffset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	res := make([]dto.DailyStatResponse, 0, len(dailyStats))

	for _, d := range dailyStats {
		res = append(res, dto.DailyStatResponse{
			Date:    d.Date(),
			Orders:  d.Orders(),
			Revenue: d.Revenue(),
		})
	}

	c.JSON(http.StatusOK, dto.ListDailyStatResponse{
		Data:  res,
		Total: total,
	})
}
