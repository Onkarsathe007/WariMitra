package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/visava/geo-service/internal/model"
	"github.com/visava/geo-service/internal/service"
)

type GeoHandler struct {
	geoSvc    *service.GeoService
	startTime time.Time
	hub       interface{ GetActiveConnections() int }
}

func NewGeoHandler(geoSvc *service.GeoService, hub interface{ GetActiveConnections() int }) *GeoHandler {
	return &GeoHandler{
		geoSvc:    geoSvc,
		startTime: time.Now(),
		hub:       hub,
	}
}

func (h *GeoHandler) HandleRadiusQuery(w http.ResponseWriter, r *http.Request) {
	var req model.RadiusQueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	results, err := h.geoSvc.RadiusQuery(ctx, req)
	if err != nil {
		slog.Error("radius query failed", "err", err)
		http.Error(w, "radius query failed", http.StatusInternalServerError)
		return
	}

	if results == nil {
		results = []model.NearbyResult{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(model.RadiusQueryResponse{Results: results})
}

func (h *GeoHandler) HandleFanOut(w http.ResponseWriter, r *http.Request) {
	var req model.FanOutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	targets, err := h.geoSvc.FanOut(ctx, req)
	if err != nil {
		slog.Error("fan-out failed", "err", err)
		http.Error(w, "fan-out failed", http.StatusInternalServerError)
		return
	}

	if targets == nil {
		targets = []model.NearbyResult{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(model.FanOutResponse{
		TargetCount: len(targets),
		Targets:     targets,
	})
}
