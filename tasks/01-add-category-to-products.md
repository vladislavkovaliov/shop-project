# Task 1: Add category to product responses

## Goal

Every product returned by `GET /api/products`, `GET /api/products/cursor`, and `POST /api/products` should include the product's category name.

## Background

The database has an M:N relationship via `product_categories`:
- `products` ← `product_categories` → `categories`
- In practice each product belongs to exactly one category, but the schema allows multiple.

For simplicity, we return the **first** category found (alphabetically or by lowest category ID).

## Changes

### 1. Domain — `domain/product/product.go`

Add a `category` field to the `Product` struct:

```go
type Product struct {
    id       int64
    title    string
    price    float64
    category string
}

func (p *Product) Category() string { return p.category }
```

Update `NewProduct(id, title, price, category)`.

### 2. Repository — `repository/product/repository.go`

Modify every SQL query that selects products to also fetch the category:

- `SELECT id, title, price FROM products …`
  → `SELECT p.id, p.title, p.price, COALESCE(c.title, '') AS category FROM products p LEFT JOIN LATERAL (SELECT c.title FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id LIMIT 1) c ON true …`

Affected methods: `List`, `ListCursor`, `Create` (modify RETURNING + follow-up query or SECOND query after insert to fetch the category by joining).

Add `&category` to every `rows.Scan()` call and pass it to `proddomain.NewProduct(…, category)`.

### 3. DTO — `http/dto/product.go`

Add `Category string` to `ProductResponse`:

```go
type ProductResponse struct {
    ID       int64   `json:"id"`
    Title    string  `json:"title"`
    Price    float64 `json:"price"`
    Category string  `json:"category"`
}
```

### 4. Handler — `http/handlers/product.go`

The mapping loop in `ListProducts`, `ListCursorProducts`, and `CreateProduct` already maps `p.Title()` and `p.Price()`. Add `Category: p.Category()`.

### 5. Swagger annotations

No changes needed — the response DTO is the source of truth for swaggo.

## Verification

Run `go build ./cmd/api/...` and manually test `GET /api/products` — each item should now have a `"category"` field.

## Files touched

| File | Change |
|---|---|
| `domain/product/product.go` | Add field + getter + constructor param |
| `domain/product/repository.go` | No change (interface unchanged) |
| `repository/product/repository.go` | Add JOIN to all queries |
| `http/dto/product.go` | Add `Category` field |
| `http/handlers/product.go` | Map new field |
