# Task 4: Add `GET /api/products/revenue-report` endpoint

## Goal

Create a new endpoint that returns a detailed revenue report table per product with columns: title, category, revenue, orders, quantity sold, and growth.

## Response format

```json
{
  "data": [
    {
      "title": "Smartphone Alpha",
      "category": "Electronics",
      "revenue": 15000.00,
      "orders": 45,
      "quantity_sold": 120,
      "growth": { "value": 12.5, "sign": "+" }
    }
  ],
  "total": 10
}
```

## Changes

### 1. Domain — `domain/product/revenue_report.go`

```go
package product

import "shop-api/domain/growth"

type RevenueReport struct {
    title        string
    category     string
    revenue      float64
    orders       int
    quantitySold int
    growth       growth.Growth
}

func NewRevenueReport(title, category string, revenue float64, orders, quantitySold int, growth growth.Growth) *RevenueReport {
    return &RevenueReport{title: title, category: category, revenue: revenue, orders: orders, quantitySold: quantitySold, growth: growth}
}

func (r *RevenueReport) Title() string          { return r.title }
func (r *RevenueReport) Category() string       { return r.category }
func (r *RevenueReport) Revenue() float64       { return r.revenue }
func (r *RevenueReport) Orders() int            { return r.orders }
func (r *RevenueReport) QuantitySold() int      { return r.quantitySold }
func (r *RevenueReport) Growth() growth.Growth  { return r.growth }
```

### 2. Repository interface — `domain/product/repository.go`

Add:

```go
RevenueReport(ctx context.Context, limit, offset int) ([]*RevenueReport, int, error)
```

### 3. Repository impl — `repository/product/repository.go`

Add `RevenueReport` method:

```sql
SELECT
    p.title,
    COALESCE(c.title, '') AS category,
    COALESCE(SUM(oi.quantity * p.price), 0) AS revenue,
    COUNT(DISTINCT oi.order_id) AS orders,
    COALESCE(SUM(oi.quantity), 0) AS quantity_sold,
    COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at >= NOW() - interval '15 days'), 0) AS recent,
    COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at < NOW() - interval '15 days'), 0) AS previous
FROM products p
LEFT JOIN product_categories pc ON pc.product_id = p.id
LEFT JOIN categories c ON c.id = pc.category_id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
GROUP BY p.id, p.title, c.title
ORDER BY revenue DESC
LIMIT $1 OFFSET $2
```

Use `growth.CalculateGrowth(recent, previous)`.

Add count query:
```sql
SELECT COUNT(*) FROM products
```

### 4. DTO — `http/dto/product.go`

```go
type RevenueReportResponse struct {
    Title        string         `json:"title"`
    Category     string         `json:"category"`
    Revenue      float64        `json:"revenue"`
    Orders       int            `json:"orders"`
    QuantitySold int            `json:"quantity_sold"`
    Growth       GrowthResponse `json:"growth"`
}

type ListRevenueReportResponse struct {
    Data  []RevenueReportResponse `json:"data"`
    Total int                     `json:"total"`
}
```

### 5. Service — `service/product/product.go`

Add method:

```go
func (s *Service) RevenueReport(ctx context.Context, limit, offset int) ([]*proddomain.RevenueReport, int, error) {
    return s.repo.RevenueReport(ctx, limit, offset)
}
```

### 6. Handler — `http/handlers/product.go`

Add `RevenueReport` handler with pagination:

```go
// RevenueReport godoc
// @Summary    Revenue report per product
// @Tags       products
// @Produce    json
// @Success    200 {object} dto.ListRevenueReportResponse
// @Router     /products/revenue-report [get]
// @Param      limit  query int false "Number of products to return (default 10)"
// @Param      offset query int false "Number of products to skip (default 0)"
func (h *ProductHandler) RevenueReport(c *gin.Context) {
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
    reports, total, err := h.service.RevenueReport(ctx, defaultLimit, defaultOffset)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
        return
    }
    res := make([]dto.RevenueReportResponse, 0, len(reports))
    for _, r := range reports {
        res = append(res, dto.RevenueReportResponse{
            Title:        r.Title(),
            Category:     r.Category(),
            Revenue:      r.Revenue(),
            Orders:       r.Orders(),
            QuantitySold: r.QuantitySold(),
            Growth: dto.GrowthResponse{
                Value: r.Growth().Value(),
                Sign:  r.Growth().Sign(),
            },
        })
    }
    c.JSON(http.StatusOK, dto.ListRevenueReportResponse{
        Data:  res,
        Total: total,
    })
}
```

### 7. Wiring — `cmd/api/wiring.go`

Add route:

```go
rg.GET("/products/revenue-report", h.RevenueReport)
```

## Verification

`GET /api/products/revenue-report?limit=5&offset=0` — returns a paginated list of product revenue reports with all specified fields.

## Files touched

| File | Change |
|---|---|
| `domain/product/revenue_report.go` | **New** — entity |
| `domain/product/repository.go` | Add `RevenueReport` to interface |
| `repository/product/repository.go` | Add SQL + mapping |
| `service/product/product.go` | Add `RevenueReport` method |
| `http/dto/product.go` | Add DTOs |
| `http/handlers/product.go` | Add handler + swagger |
| `cmd/api/wiring.go` | Register route |
