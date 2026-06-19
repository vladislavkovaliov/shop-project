package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"shop-api/http/handlers"
	"shop-api/http/middleware"
	"shop-api/internal/events"
	"shop-api/internal/rabbit"
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

func setupRouter(pool *pgxpool.Pool, producer *events.Producer, rabbitProducer *rabbit.Producer) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		wireProducts(api, pool)
		wireOrders(api, pool, producer, rabbitProducer)
		wireCategories(api, pool)
		wireUsers(api, pool, producer)
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
	rg.GET("/products/revenue-stats", h.GetRevenueStats)
}

func wireOrders(rg *gin.RouterGroup, pool *pgxpool.Pool, producer *events.Producer, rabbitProduct *rabbit.Producer) {
	authMw := middleware.AuthMiddleware(pool)

	repo := orderrepo.NewPgxRepository(pool)
	svc := orderservice.New(repo, producer, rabbitProduct)
	h := handlers.NewOrderHandler(svc)

	rg.GET("/orders/stats", authMw, h.StatsOrder)
	rg.GET("/orders", authMw, h.ListOrder)
	rg.POST("/orders", authMw, h.CreateOrder)
	rg.GET("/orders/daily-purchases", authMw, h.ListDailyPurchases)
	rg.GET("/orders/daily-stats", authMw, h.GetDailyStats)
	rg.GET("/orders/:orderID/items", authMw, h.GetOrderItems)
	// public dashboard endpoints
	rg.GET("/orders/trend", h.GetOrdersTrend)
	rg.GET("/orders/count", h.CountOrders)
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

func wireUsers(rg *gin.RouterGroup, pool *pgxpool.Pool, producer *events.Producer) {
	authMw := middleware.AuthMiddleware(pool)

	repo := userrepo.NewPgxRepository(pool)
	svc := userservice.New(repo, producer)
	h := handlers.NewUserHandler(svc)

	rg.GET("/users/daily-registrations", authMw, h.ListDailyUserRegistration)
	rg.POST("/users", authMw, h.CreateUser)
	rg.GET("/users", authMw, h.ListUsers)
	rg.GET("/users/cursor", authMw, h.ListCursorUsers)
	rg.GET("/users/search", authMw, h.Search)
	rg.GET("/users/top-3-users", authMw, h.ListTop3Users)
	rg.GET("/users/by-most-expensive-product", authMw, h.ListUserByMostExpensiveProduct)
	// public dashboard endpoints
	rg.GET("/users/count", h.CountUser)
	rg.GET("/users/registration-trend", h.GetUserRegistrationTrend)
}
