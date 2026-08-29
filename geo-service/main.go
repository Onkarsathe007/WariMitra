package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"

	"github.com/visava/geo-service/internal/config"
	"github.com/visava/geo-service/internal/handler"
	"github.com/visava/geo-service/internal/middleware"
	"github.com/visava/geo-service/internal/service"
	"github.com/visava/geo-service/internal/ws"
)

func main() {
	cfg := config.Load()

	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: parseLogLevel(cfg.LogLevel),
	})))

	rdb := redis.NewClient(&redis.Options{
		Addr: extractRedisAddr(cfg.RedisURL),
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		slog.Error("failed to connect to Redis", "err", err)
		os.Exit(1)
	}
	slog.Info("connected to Redis")

	hub := ws.NewHub()
	go hub.Run()

	locationSvc := service.NewLocationService(rdb)
	pubsubSvc := service.NewPubSubService(rdb)
	geoSvc := service.NewGeoService(locationSvc, pubsubSvc)

	pubsubSvc.Subscribe(ctx, func(channel string, payload string) {
		hub.Broadcast([]byte(payload))
	})

	locationHandler := handler.NewLocationHandler(locationSvc, hub)
	geoHandler := handler.NewGeoHandler(geoSvc, hub)
	healthHandler := handler.NewHealthHandler(hub)

	r := chi.NewRouter()

	corsOrigins := strings.Split(cfg.CORSOrigins, ",")
	r.Use(middleware.CORS(corsOrigins))
	r.Use(middleware.Logging)

	r.Get("/health", healthHandler.HandleHealth)

	r.Post("/ws/location", locationHandler.HandleLocationUpdate)
	r.Get("/ws/location", locationHandler.HandleWebSocket)
	r.Get("/internal/geo/wari-location/{wariId}", locationHandler.HandleGetWariLocation)
	r.Post("/internal/geo/location", locationHandler.HandleLocationUpdate)
	r.Delete("/internal/geo/location/{memberId}", locationHandler.HandleLocationRemove)

	r.Post("/internal/geo/radius-query", geoHandler.HandleRadiusQuery)
	r.Post("/internal/geo/fan-out", geoHandler.HandleFanOut)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("geo service starting", "port", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server failed", "err", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("server forced to shutdown", "err", err)
	}

	if err := rdb.Close(); err != nil {
		slog.Error("failed to close Redis", "err", err)
	}

	slog.Info("server exited")
}

func extractRedisAddr(url string) string {
	url = strings.TrimPrefix(url, "redis://")
	if idx := strings.Index(url, "/"); idx != -1 {
		url = url[:idx]
	}
	if idx := strings.Index(url, "?"); idx != -1 {
		url = url[:idx]
	}
	return url
}

func parseLogLevel(level string) slog.Level {
	switch level {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
