package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/visava/geo-service/internal/model"
	"github.com/visava/geo-service/internal/service"
	"github.com/visava/geo-service/internal/ws"
)

type LocationHandler struct {
	locationSvc *service.LocationService
	hub         *ws.Hub
}

func NewLocationHandler(locationSvc *service.LocationService, hub *ws.Hub) *LocationHandler {
	return &LocationHandler{
		locationSvc: locationSvc,
		hub:         hub,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *LocationHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("websocket upgrade failed", "err", err)
		return
	}

	client := h.hub.RegisterClient(conn)

	go client.WritePump()
	go client.ReadPump()
}

func (h *LocationHandler) HandleLocationUpdate(w http.ResponseWriter, r *http.Request) {
	var loc model.Location
	if err := json.NewDecoder(r.Body).Decode(&loc); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	loc.Timestamp = time.Now().UnixMilli()

	ctx := r.Context()
	if err := h.locationSvc.UpdateLocation(ctx, loc); err != nil {
		slog.Error("failed to update location", "err", err)
		http.Error(w, "failed to update location", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (h *LocationHandler) HandleGetWariLocation(w http.ResponseWriter, r *http.Request) {
	wariID := chi.URLParam(r, "wariId")

	ctx := r.Context()
	loc, err := h.locationSvc.GetWariLocation(ctx, wariID)
	if err != nil {
		http.Error(w, "wari location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loc)
}

func (h *LocationHandler) HandleLocationRemove(w http.ResponseWriter, r *http.Request) {
	memberID := chi.URLParam(r, "memberId")
	if memberID == "" {
		http.Error(w, "memberId is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	if err := h.locationSvc.RemoveLocation(ctx, memberID); err != nil {
		slog.Error("failed to remove location", "err", err, "memberId", memberID)
		http.Error(w, "failed to remove location", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
