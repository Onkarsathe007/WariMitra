package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

type HealthHandler struct {
	startTime time.Time
	hub       interface{ GetActiveConnections() int }
}

func NewHealthHandler(hub interface{ GetActiveConnections() int }) *HealthHandler {
	return &HealthHandler{
		startTime: time.Now(),
		hub:       hub,
	}
}

func (h *HealthHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	uptime := time.Since(h.startTime).Seconds()

	response := map[string]interface{}{
		"status":            "ok",
		"uptime":            uptime,
		"activeConnections": h.hub.GetActiveConnections(),
		"timestamp":         time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
