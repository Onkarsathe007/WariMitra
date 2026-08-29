# Geo Service

High-performance geospatial service for Visava. Handles live location tracking, radius queries, WebSocket connections for real-time location updates, and alert fan-out computation. Built in Go for concurrency — this is the service that handles the highest throughput during Wari season (thousands of concurrent location pings).

## Tech Stack

- Go 1.22 + chi router
- Redis GEO (`GEOADD`, `GEORADIUS`) for geospatial queries
- gorilla/websocket for real-time location updates
- Redis Pub/Sub for alert fan-out

## Quick Start

```bash
cd geo-service
go run .
```

Server runs on `http://localhost:8081`.

**Prerequisites:** Redis must be running on `localhost:6379`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8081` | HTTP port |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection string |
| `LOG_LEVEL` | No | `info` | `debug`, `info`, `warn`, `error` |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{"status": "ok", "service": "geo-service", "active_connections": N, "uptime": ...}` |

### Location Updates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ws/location` | Submit a location update via HTTP |
| `GET` | `/ws/location` | WebSocket endpoint for real-time location pings |

**HTTP Location Update:**
```json
POST /ws/location
{
  "id": "user-or-wari-id",
  "type": "wari",
  "lat": 18.5204,
  "lng": 73.8567,
  "wariId": "wari-123"
}
→ { "status": "ok" }
```

**WebSocket Messages:**

Client → Server:
```json
{ "type": "location_update", "lat": 18.5204, "lng": 73.8567, "wariId": "wari-123" }
{ "type": "join_wari", "wariId": "wari-123" }
{ "type": "leave_wari", "wariId": "wari-123" }
```

Server → Client:
```json
{ "type": "ack", "timestamp": 1234567890 }
{ "type": "location_update", "wariId": "wari-123", "lat": 18.5204, "lng": 73.8567 }
```

### Internal API (called by Core API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/internal/geo/radius-query` | Find entities within radius of a point |
| `POST` | `/internal/geo/fan-out` | Compute targets for alert distribution |
| `GET` | `/internal/geo/wari-location/:wariId` | Get a wari's current cached location |

**Radius Query:**
```json
POST /internal/geo/radius-query
{
  "lat": 18.5204,
  "lng": 73.8567,
  "radius": 5,
  "type": "medical"
}
→ {
  "results": [
    { "id": "...", "name": "...", "lat": 18.53, "lng": 73.86, "distance": 1.2 }
  ]
}
```

**Fan-Out:**
```json
POST /internal/geo/fan-out
{
  "lat": 18.5204,
  "lng": 73.8567,
  "radius": 2,
  "excludeId": "reporter-id"
}
→ {
  "target_count": 15,
  "targets": [
    { "id": "...", "name": "...", "lat": 18.53, "lng": 73.86, "distance": 0.8 }
  ]
}
```

**Get Wari Location:**
```json
GET /internal/geo/wari-location/wari-123
→ { "lat": 18.5204, "lng": 73.8567, "timestamp": 1234567890 }
```

## How Redis GEO Works

Location data is stored using Redis native geospatial commands:

- **`GEOADD`** — stores a location: `GEOADD wari:locations <lng> <lat> <id>`
- **`GEORADIUS`** — finds nearby points: `GEORADIUS wari:locations <lng> <lat> <radius> km`
- **`GEOPOS`** — retrieves a point's coordinates

This is sub-second even with hundreds of thousands of tracked points, which is critical during Wari season.

## WebSocket Hub

The WebSocket hub manages concurrent connections:

1. Client connects to `ws://server:8081/ws/location`
2. Client sends `join_wari` to subscribe to a wari's room
3. Location updates from any client in the room are broadcast to all others
4. The hub uses a `sync.RWMutex` for thread-safe client management

Room naming: `wari:{wariId}` — each wari gets its own broadcast room.

## Alert Fan-Out Flow

When a report is confirmed in the Core API:

1. Core API calls `POST /internal/geo/fan-out` with the report location and radius
2. Geo Service uses Redis `GEORADIUS` to find all tracked users within that radius
3. Geo Service publishes the alert targets to Redis Pub/Sub
4. A notification worker (not yet implemented) subscribes and pushes Web Push notifications to smartphone users

## Project Structure

```
geo-service/
├── go.mod
├── go.sum
├── main.go                     # Entry point, router setup, graceful shutdown
├── Dockerfile
└── internal/
    ├── config/
    │   └── env.go              # Environment variable loading
    ├── handler/
    │   ├── geo.go              # Radius query + fan-out handlers
    │   ├── location.go         # Location update + WebSocket handlers
    │   └── health.go           # Health check
    ├── service/
    │   ├── location.go         # Redis GEO operations (GEOADD, GEORADIUS)
    │   ├── geo.go              # Radius query + fan-out business logic
    │   └── pubsub.go           # Redis Pub/Sub for alert distribution
    ├── model/
    │   ├── location.go         # Location, WSMessage structs
    │   └── geo.go              # RadiusQuery, FanOut request/response structs
    ├── middleware/
    │   ├── logging.go          # Request logging
    │   └── cors.go             # CORS middleware
    └── ws/
        └── hub.go              # WebSocket hub (connection management, rooms, broadcast)
```

## Building & Running

```bash
# Development
go run .

# Build binary
go build -o geo-service .

# Docker
docker build -t visava-geo-service .
docker run -p 8081:8081 -e REDIS_URL=redis://redis:6379 visava-geo-service
```
