# Task 3: Move `GetWidgetStats` to orders, delete widget package

## Goal

Remove the `domain/widget/`, `service/widget/`, and `repository/widget/` packages entirely. Move the `GetWidgetStats` logic into the order layer and update the handler.

## Background

`GetWidgetStats` returns `{ totalCategories, totalProducts, topCategory }` — stats that derive from both categories and orders (revenue). The current flow:

```
GET /api/categories/stats
  → CategoryHandler.GetCategoryStats
    → widgetService.GetWidgetStats
      → widgetRepository.GetWidgetStats (SQL with categories + orders)
```

After the move:

```
GET /api/orders/stats/categories
  → OrderHandler.GetCategoryStats
    → orderService.GetWidgetStats
      → orderRepository.GetWidgetStats (same SQL, moved)
```

## Changes

### 1. Domain — `domain/order/`

Add entities (copied from `domain/widget/`):

- `domain/order/widget_stats.go` — `WidgetStats` struct with `TotalCategories()`, `TotalProducts()`, `TopCategory()`.
- `domain/order/top_category.go` — `TopCategory` struct with `Title()`, `Revenue()`.

### 2. Repository interface — `domain/order/repository.go`

Add method to the `Repository` interface:

```go
GetWidgetStats(ctx context.Context) (*WidgetStats, error)
```

### 3. Repository impl — `repository/order/repository.go`

Paste the SQL query from the old `repository/widget/repository.go` into a new `GetWidgetStats` method:

```go
func (r *PgxRepository) GetWidgetStats(ctx context.Context) (*orderdomain.WidgetStats, error) {
    var totalCategories, totalProducts int
    var topCategoryTitle string
    var topCategoryRevenue float64

    err := r.pool.QueryRow(ctx, `
        SELECT
            (SELECT COUNT(*) FROM categories) AS total_categories,
            (SELECT COUNT(*) FROM products) AS total_products,
            top.title,
            top.revenue
        FROM (
            SELECT
                c.title,
                COALESCE(SUM(oi.quantity * p.price), 0) AS revenue
            FROM categories c
            LEFT JOIN product_categories pc ON pc.category_id = c.id
            LEFT JOIN products p ON p.id = pc.product_id
            LEFT JOIN order_items oi ON oi.product_id = p.id
            LEFT JOIN orders o ON o.id = oi.order_id
            GROUP BY c.id, c.title
            ORDER BY revenue DESC
            LIMIT 1
        ) top
    `).Scan(&totalCategories, &totalProducts, &topCategoryTitle, &topCategoryRevenue)

    if err != nil {
        return nil, err
    }

    topCategory := orderdomain.NewTopCategory(topCategoryTitle, topCategoryRevenue)

    return orderdomain.NewWidgetStats(totalCategories, totalProducts, topCategory), nil
}
```

### 4. Service — `service/order/order.go`

Add method:

```go
func (s *Service) GetWidgetStats(ctx context.Context) (*orderdomain.WidgetStats, error) {
    return s.repo.GetWidgetStats(ctx)
}
```

### 5. Handler — `http/handlers/order.go`

Add a new method `GetCategoryStats`:

```go
func (h *OrderHandler) GetCategoryStats(c *gin.Context) {
    ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
    defer cancel()
    stats, err := h.service.GetWidgetStats(ctx)
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
```

Add swagger annotation.

### 6. Handler — `http/handlers/category.go`

- Remove `widgetService` field from `CategoryHandler`.
- Remove `widgetService *widgetservice.Service` parameter from `NewCategoryHandler`.
- Remove the `GetCategoryStats` method.

### 7. Wiring — `cmd/api/wiring.go`

**`wireCategories`**: Remove `widgetRepo`, `widgetSvc` creation. Remove widget imports. Update `NewCategoryHandler` call.

**`wireOrders`**: Add `rg.GET("/orders/stats/categories", h.GetCategoryStats)`.

### 8. Cleanup

Delete entire directories:
- `domain/widget/`
- `service/widget/`
- `repository/widget/`

Remove imports for `widgetrepo`, `widgetservice`, `widgetdomain` from all remaining files.

## Verification

- `go build ./cmd/api/...` should succeed.
- `GET /api/orders/stats/categories` should return the same data as before.
- `GET /api/categories/stats` should return 404.

## Files touched

| File | Change |
|---|---|
| `domain/order/widget_stats.go` | **New** — copied from widget |
| `domain/order/top_category.go` | **New** — copied from widget |
| `domain/order/repository.go` | Add `GetWidgetStats` to interface |
| `repository/order/repository.go` | Add `GetWidgetStats` method |
| `service/order/order.go` | Add `GetWidgetStats` method |
| `http/handlers/order.go` | Add `GetCategoryStats` handler |
| `http/handlers/category.go` | Remove widgetService param, remove handler |
| `cmd/api/wiring.go` | Rewire — widget removed, new order route |
| `domain/widget/` | **Delete** entire directory |
| `service/widget/` | **Delete** entire directory |
| `repository/widget/` | **Delete** entire directory |
| `http/dto/widget.go` | Keep (DTO is still used by order handler) |
