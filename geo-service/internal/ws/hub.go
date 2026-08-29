package ws

import (
	"encoding/json"
	"log/slog"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/visava/geo-service/internal/model"
)

type Client struct {
	conn     *websocket.Conn
	send     chan []byte
	rooms    map[string]bool
	hub      *Hub
	wariID   string
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	rooms      map[string]map[*Client]bool
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			slog.Info("client connected", "total", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				for room := range client.rooms {
					if clients, ok := h.rooms[room]; ok {
						delete(clients, client)
					}
				}
			}
			h.mu.Unlock()
			slog.Info("client disconnected", "total", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) RegisterClient(conn *websocket.Conn) *Client {
	client := &Client{
		conn:  conn,
		send:  make(chan []byte, 256),
		rooms: make(map[string]bool),
		hub:   h,
	}
	h.register <- client
	return client
}

func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

func (h *Hub) JoinRoom(client *Client, room string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[room] == nil {
		h.rooms[room] = make(map[*Client]bool)
	}
	h.rooms[room][client] = true
	client.rooms[room] = true
}

func (h *Hub) LeaveRoom(client *Client, room string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clients, ok := h.rooms[room]; ok {
		delete(clients, client)
	}
	delete(client.rooms, room)
}

func (h *Hub) BroadcastToRoom(room string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.rooms[room]; ok {
		for client := range clients {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

func (h *Hub) GetActiveConnections() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) Broadcast(message []byte) {
	h.broadcast <- message
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.UnregisterClient(c)
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				slog.Error("websocket error", "err", err)
			}
			break
		}

		var msg model.WSMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "location_update":
			c.handleLocationUpdate(msg)
		case "join_wari":
			if msg.WariID != "" {
				c.hub.JoinRoom(c, "wari:"+msg.WariID)
				c.wariID = msg.WariID
			}
		case "leave_wari":
			if msg.WariID != "" {
				c.hub.LeaveRoom(c, "wari:"+msg.WariID)
			}
		}
	}
}

func (c *Client) handleLocationUpdate(msg model.WSMessage) {
	ack := model.WSMessage{
		Type: "ack",
		Ack: &model.WSAck{
			Timestamp: msg.Timestamp,
		},
	}

	ackBytes, err := json.Marshal(ack)
	if err == nil {
		select {
		case c.send <- ackBytes:
		default:
		}
	}

	if c.wariID != "" {
		broadcastMsg := model.WSMessage{
			Type:   "location_update",
			WariID: c.wariID,
			Lat:    msg.Lat,
			Lng:    msg.Lng,
		}
		broadcastBytes, _ := json.Marshal(broadcastMsg)
		c.hub.BroadcastToRoom("wari:"+c.wariID, broadcastBytes)
	}
}

func (c *Client) WritePump() {
	defer c.conn.Close()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}
