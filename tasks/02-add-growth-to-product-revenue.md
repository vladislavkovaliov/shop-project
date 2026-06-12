# Task 2: Add growth to `GET /api/products/revenue`

## Goal

The `GET /api/products/revenue` endpoint now returns `{ title, revenue, growth: { value, sign } }` for each product, where growth is the percentage change in revenue comparing the last 15 days to the period before that.

This mirrors the growth calculation already implemented in `GET /api/categories/revenue`.

## Background

The growth pattern exists in `domain/category/category_revenue.go`:
- `Growth` struct with `Value() float64` and `Sign() string`
- `calculateGrowth(recent, previous)` function in `repository/category/repository.go`

We will extract these into a shared package so product revenue can reuse them (see Task 5).

## Changes

### 1. Shared package — `domain/growth/growth.go`

```go
package growth

type Growth struct {
    value float64
    sign  string
}

func NewGrowth(value float64, sign string) Growth { … }
func (g Growth) Value() float64 { return g.value }
func (g Growth) Sign() string   { return g.sign }

func CalculateGrowth(recent, previous float64) Growth { … }
```

### 2. Refactor `domain/category/category_revenue.go`

Replace the inline `Growth` struct with `growth.Growth` from the shared package.

### 3. Domain — `domain/product/totalRevenue.go`

Add growth field:

```go
type TotalRevenue struct {
    title   string
    revenue float64
    growth  growth.Growth
}
```

Update `NewTotalRevenue` and add `Growth() growth.Growth` getter.

### 4. Repository — `repository/product/repository.go`

Modify the SQL in `TotalRevenue`:

```sql
SELECT
    p.title,
    COALESCE(SUM(oi.quantity * p.price), 0) AS revenue,
    COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at >= NOW() - interval '15 days'), 0) AS recent,
    COALESCE(SUM(oi.quantity * p.price) FILTER (WHERE o.created_at < NOW() - interval '15 days'), 0) AS previous
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
GROUP BY p.id, p.title
ORDER BY revenue DESC
```

Call `growth.CalculateGrowth(recent, previous)` after scanning.

### 5. DTO — `http/dto/product.go`

Add `Growth` field to `TotalRevenueResponse`:

```go
type TotalRevenueResponse struct {
    Title   string         `json:"title"`
    Revenue float64        `json:"revenue"`
    Growth  GrowthResponse `json:"growth"`
}
```

### 6. Handler — `http/handlers/product.go`

Map the new field: `Growth: dto.GrowthResponse{Value: p.Growth().Value(), Sign: p.Growth().Sign()}`.

## Verification

`go build ./cmd/api/...` then `GET /api/products/revenue` — each item should include `"growth": { "value": 12.5, "sign": "+" }`.

## Files touched

| File | Change |
|---|---|
| `domain/growth/growth.go` | **New** — shared Growth + CalculateGrowth |
| `domain/category/category_revenue.go` | Import and use `growth.Growth` |
| `repository/category/repository.go` | Import and use `growth.CalculateGrowth` |
| `domain/product/totalRevenue.go` | Add growth field |
| `repository/product/repository.go` | Add growth SQL + calculation |
| `http/dto/product.go` | Add `Growth` field |
| `http/handlers/product.go` | Map growth |
