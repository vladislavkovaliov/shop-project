package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"shop-api/http/handlers"
	"shop-api/internal/events"
	categoryrepo "shop-api/repository/category"
	orderrepo "shop-api/repository/order"
	productrepo "shop-api/repository/product"
	userrepo "shop-api/repository/user"
	widgetrepo "shop-api/repository/widget"
	categoryservice "shop-api/service/category"
	orderservice "shop-api/service/order"
	productservice "shop-api/service/product"
	userservice "shop-api/service/user"
	widgetservice "shop-api/service/widget"
)

func setupRouter(pool *pgxpool.Pool, producer *events.Producer) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		wireProducts(api, pool)
		wireOrders(api, pool, producer)
		wireCategories(api, pool)
		wireUsers(api, pool)
	}

	api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	return r
}

func wireProducts(rg *gin.RouterGroup, pool *pgxpool.Pool) {
	repo := productrepo.NewPgxRepository(pool)
	svc := productservice.New(repo)
	h := handlers.NewProductHandler(svc)

	rg.GET("/products", h.ListProducts)
	rg.POST("/products", h.CreateProduct)
	rg.GET("/products/cursor", h.ListCursorProducts)
	rg.GET("/products/revenue-report", h.ListRevenueReport)
}

func wireOrders(rg *gin.RouterGroup, pool *pgxpool.Pool, producer *events.Producer) {
	repo := orderrepo.NewPgxRepository(pool)
	svc := orderservice.New(repo, producer)
	h := handlers.NewOrderHandler(svc)

	rg.GET("/orders/stats", h.StatsOrder)
	rg.GET("/orders", h.ListOrder)
	rg.POST("/orders", h.CreateOrder)
	rg.GET("/orders/daily-purchases", h.ListDailyPurchases)
	rg.GET("/orders/daily-stats", h.GetDailyStats)
	rg.GET("/orders/:orderID/items", h.GetOrderItems)
}

func wireCategories(rg *gin.RouterGroup, pool *pgxpool.Pool) {
	repo := categoryrepo.NewPgxRepository(pool)
	svc := categoryservice.New(repo)
	widgetRepo := widgetrepo.NewPgxRepository(pool)
	widgetSvc := widgetservice.New(widgetRepo)
	h := handlers.NewCategoryHandler(svc, widgetSvc)

	rg.GET("/categories", h.ListCategory)
	rg.GET("/categories/avarage-price", h.ListCategoryAvaragePrice)
	rg.GET("/categories/revenue", h.ListCategoryRevenue)
	rg.GET("/categories/stats", h.GetCategoryStats)
}

func wireUsers(rg *gin.RouterGroup, pool *pgxpool.Pool) {
	repo := userrepo.NewPgxRepository(pool)
	svc := userservice.New(repo)
	h := handlers.NewUserHandler(svc)

	rg.GET("/users", h.ListUsers)
	rg.GET("/users/cursor", h.ListCursorUsers)
	rg.GET("/users/search", h.Search)
	rg.GET("/users/top-3-users", h.ListTop3Users)
	rg.GET("/users/by-most-expensive-product", h.ListUserByMostExpensiveProduct)

}
