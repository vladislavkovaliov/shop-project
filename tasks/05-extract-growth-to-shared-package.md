# Task 5: Extract `Growth` + `calculateGrowth` to shared `domain/growth`

## Goal

Create a reusable `domain/growth` package so both `domain/category` and `domain/product` can use the same `Growth` type and `CalculateGrowth` function.

## Changes

### 1. New file — `domain/growth/growth.go`

```go
package growth

import "math"

type Growth struct {
    value float64
    sign   string
}

func NewGrowth(value float64, sign string) Growth {
    return Growth{value: value, sign: sign}
}

func (g Growth) Value() float64 { return g.value }
func (g Growth) Sign() string   { return g.sign }

func CalculateGrowth(recent, previous float64) Growth {
    if previous == 0 {
        return NewGrowth(0, "+")
    }
    g := ((recent - previous) / previous) * 100
    sign := "+"
    if g < 0 {
        sign = "-"
        g = -g
    }
    return NewGrowth(math.Round(g*10)/10, sign)
}
```

### 2. Refactor `domain/category/category_revenue.go`

- Remove the inline `Growth` struct definition.
- Add import: `"shop-api/domain/growth"`.
- Change `CategoryRevenue.growth` field type from the inline `Growth` to `growth.Growth`.
- Update `Growth() Growth` return type to `growth.Growth`.
- Update `NewCategoryRevenue` parameter type from the old inline `Growth` to `growth.Growth`.

### 3. Refactor `repository/category/repository.go`

- Remove the inline `calculateGrowth` function.
- Add import: `"shop-api/domain/growth"`.
- Replace all calls to `calculateGrowth(...)` with `growth.CalculateGrowth(...)`.

### 4. Refactor `domain/product/totalRevenue.go`

- Add import: `"shop-api/domain/growth"`.
- Add `growth growth.Growth` field to `TotalRevenue`.
- Add `func (t *TotalRevenue) Growth() growth.Growth { return t.growth }`.
- Update `NewTotalRevenue(title, revenue, growth)`.

### 5. Refactor `repository/product/repository.go`

- Add import: `"shop-api/domain/growth"`.
- In `TotalRevenue`, after scanning `recent` and `previous`, compute:
  ```go
  growthValue := growth.CalculateGrowth(recent, previous)
  ```
- Pass `growthValue` to `proddomain.NewTotalRevenue(title, revenue, growthValue)`.

### 6. Refactor `domain/product/revenue_report.go` (from Task 4)

- Import `"shop-api/domain/growth"`.
- Use `growth.Growth` for the `growth` field.

### 7. Refactor `repository/product/repository.go` (from Task 4)

- In `RevenueReport`, use `growth.CalculateGrowth(recent, previous)`.

## Verification

`go build ./cmd/api/...` — all layers that need growth now reference the single shared package.

## Files touched

| File | Change |
|---|---|
| `domain/growth/growth.go` | **New** |
| `domain/category/category_revenue.go` | Remove inline Growth, import shared |
| `repository/category/repository.go` | Remove inline calculateGrowth, import shared |
| `domain/product/totalRevenue.go` | Import shared Growth |
| `repository/product/repository.go` | Import shared CalculateGrowth |
| `domain/product/revenue_report.go` | Import shared Growth |
