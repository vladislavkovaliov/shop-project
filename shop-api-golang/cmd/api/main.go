// @title			Shop API
// @version		1.0
// @description	Educational SQL workshop backend API
// @BasePath		/api
//
// @securityDefinitions.apikey	BearerAuth
// @in							header
// @name						Authorization
package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	_ "shop-api/docs"
	"shop-api/internal/config"
	"shop-api/internal/events"
	"shop-api/internal/rabbit"

	orderrepo "shop-api/repository/order"
	userrepo "shop-api/repository/user"
)

func main() {
	cfg := config.LoadConfig()

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseUrl)

	if err != nil {
		log.Fatalf("unable to connect to database: %v", err)
	}

	defer pool.Close()

	brokers := []string{cfg.KafkaBrockers}

	producer := events.NewProducer(brokers)

	rabbitProducer, err := rabbit.NewProducer(cfg.RABBITMQ_URL)

	if err != nil {
		log.Fatalf("failed to create rabbit producer: %v", err)
	}

	defer rabbitProducer.Close()

	rabbitConsumer, err := rabbit.NewConsumer(cfg.RABBITMQ_URL)

	if err != nil {
		log.Fatalf("failed to create rabbit consumer: %v", err)
	}

	defer rabbitConsumer.Close()

	defer producer.Close()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	orderRepo := orderrepo.NewPgxRepository(pool)
	userRepo := userrepo.NewPgxRepository(pool)

	go events.StartOrderConsumer(ctx, brokers, "shop-api-orders", orderRepo)
	go events.StartUserConsumer(ctx, brokers, "shop-api-users", userRepo)
	go rabbitConsumer.Start(ctx)

	r := setupRouter(pool, producer, rabbitProducer)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server failed: %v", err)
		}
	}()

	<-ctx.Done()

	log.Printf("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}
}
