# Visava

**A support system for Varkaris on their pilgrimage to Pandharpur.**

## Problem

Every year, lakhs of Varkaris walk from their villages to Pandharpur as part of the Wari. Along the way, they struggle to find help they urgently need — medicine, food, and people willing to assist them. At the same time, many well-meaning people and organizations across Maharashtra *do* offer help along the route, but there's no reliable way for a Varkari to find the right help at the right moment.

A large number of Varkaris don't carry smartphones — many still use basic keypad phones. Any solution has to work for them too, not just for the internet-connected minority.

Visava exists to close this gap: connecting Varkaris who need help with the people and services who can provide it, in real time, regardless of what phone they carry.

## Who Uses Visava

There are four groups of people involved:

1. **Varkaris (without smartphones)** — pilgrims using basic keypad phones
2. **Varkaris (with smartphones)** — pilgrims who can access a web app
3. **Helpers** — people and organizations who want to offer services (medical, food, etc.) to Varkaris along the route
4. **General Public** — people who simply want to follow the Wari, see where it is, and learn about it

---

## 1. Varkaris Without a Smartphone

These pilgrims have exactly one way to reach Visava: **a phone call to a helpline number.**

They call in, and a conversational voice agent picks up. The agent can:

- Understand the Varkari's spoken query (in their own language)
- Look up nearby help — medical camps, food points, or people who can assist — and either connect the call directly to that person, or point out where help is available nearby
- Handle **missing person reports** — when someone reports a person missing, a verified alert goes out to relevant people nearby
- Handle **lost & found item reports** — when someone reports finding a valuable item, it gets logged and an alert goes out to people in the surrounding area, so it can be reunited with its owner

Essentially, this is a single phone call standing in for everything a smartphone app would normally offer — medical help, food help, missing person alerts, and lost & found — made accessible to someone with the simplest possible phone.

## 2. Varkaris With a Smartphone (Web App)

Visava is a **responsive web app** (not a native mobile app) built for people who are almost always going to be using it on a phone screen while walking.

These Varkaris can:

- Talk to the **same voice agent** available to phone-only users, but from within the app
- **Track their own Wari's live location** — they add their Wari's name (typically their village or the name of the group they're walking with), and their live location feeds into the shared map
- **See a live map of all ongoing Waris** — not just their own. Clicking on any Wari shows detailed information about it (history, significance, associated places — e.g., clicking on the Sant Tukaram Wari would show information and imagery related to Dehu)
- **Receive location-based alerts** — missing person alerts and found-item alerts within a relevant radius (e.g., 1–2 km) of their current location
- Access all the help services (medical, food, etc.) added by Helpers, shown on the map

## 3. Helpers — People Who Want to Support Varkaris

These are individuals or organizations who want to offer something along the route — a medical camp, a food stall, or any other kind of support.

They can:

- **Add their service to the map**, so it's visible to Varkaris looking for help nearby
- View the same live Wari map as everyone else, to understand where pilgrims currently are
- Be reachable in an emergency — their contact number is stored so the voice agent can connect a Varkari directly to them when needed

## 4. General Public

People with no direct involvement in the Wari, but who want to:

- See where a Wari currently is on the live map
- Learn more about a specific Wari — its route, history, and significance

---

## Core Idea, In One Line

No matter what phone a Varkari carries, they should be one call or one tap away from finding real help — medical, food, a missing person alert, or a found item — from real people nearby.

---

## System Architecture

### Services

| Service | Tech | Port | Purpose |
|---------|------|------|---------|
| **Core API** | Node.js + Express + TypeScript | 3000 | Business logic, CRUD, auth, reports |
| **Geo Service** | Go + chi router | 8081 | Location tracking, radius queries, WebSocket hub |
| **Voice Agent** | Node.js + Express | 4000 | Vapi voice AI webhook server |
| **MongoDB** | Mongo 7.0 | 27017 | Primary database |
| **Redis** | Redis 7 | 6379 | Live location cache, pub/sub |

### Data Flow

```
Phone Call → Vapi (STT/LLM/TTS) → Voice Agent (tool webhook) → Core API (HTTP)
                                                                     ↓
Voice Agent → Core API (HTTP) → MongoDB (data)
                             → Geo Service (radius queries)
                             → Redis (live locations)

Smartphone → Web App → Core API (REST + Socket.IO) → MongoDB
                                                    → Geo Service (WebSocket)
```

### Voice Agent Flow (Vapi)

```
1. Varkari calls helpline number
2. Vapi receives call → LLM processes speech with system prompt
3. LLM decides to use a tool → Vapi POSTs to our webhook
4. Voice Agent calls Core API → returns result to Vapi
5. Vapi LLM generates response → TTS plays to caller
6. Loop continues until end session or transfer
```

---

## API Reference

### Core API (port 3000)

**Auth:**
- `POST /api/v1/auth/send-otp` — Send OTP to phone
- `POST /api/v1/auth/verify-otp` — Verify OTP, get JWT
- `GET /api/v1/auth/me` — Get current user (auth required)

**Waris:**
- `GET /api/v1/waris` — List waris (supports radius query)
- `GET /api/v1/waris/:id` — Get wari details
- `POST /api/v1/waris` — Create wari (admin only)
- `PATCH /api/v1/waris/:id` — Update wari (admin only)

**Camps:**
- `GET /api/v1/camps` — List camps (supports radius query)
- `GET /api/v1/camps/:id` — Get camp details
- `POST /api/v1/camps` — Create camp (helper/admin)
- `PATCH /api/v1/camps/:id` — Update camp (owner/admin)

**Services:**
- `GET /api/v1/services` — List services (supports radius query)
- `GET /api/v1/services/:id` — Get service details
- `POST /api/v1/services` — Create service (helper/admin)
- `PATCH /api/v1/services/:id` — Update service (owner/admin)
- `DELETE /api/v1/services/:id` — Delete service (owner/admin)

**Reports:**
- `GET /api/v1/reports` — List reports
- `GET /api/v1/reports/:id` — Get report details
- `POST /api/v1/reports` — Create report (auth required)
- `PATCH /api/v1/reports/:id/confirm` — Confirm report (reporter only)
- `PATCH /api/v1/reports/:id/resolve` — Resolve report

**Health:**
- `GET /health` — Health check

### Geo Service (port 8081)

**WebSocket:**
- `ws://server:8081/ws/location` — Location pings from smartphone clients

**Internal API:**
- `POST /internal/geo/radius-query` — Find nearby entities
- `POST /internal/geo/fan-out` — Compute alert targets
- `GET /internal/geo/wari-location/:wariId` — Get wari's current location

**Health:**
- `GET /health` — Health check

### Voice Agent (port 4000)

**Vapi Tool Webhooks:**
- `POST /tools/find-services` — Search nearby services
- `POST /tools/create-report` — Create report
- `POST /tools/find-camps` — Search nearby camps
- `POST /tools/transfer-to-helper` — Transfer call

**Health:**
- `GET /health` — Health check

---

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Vapi account (for voice AI)
- Node.js 22+ (for local dev)
- Go 1.22+ (for local dev)

### Quick Start
```bash
# Clone and setup
cp core-api/.env.example core-api/.env
cp geo-service/.env.example geo-service/.env
cp voice-agent/.env.example voice-agent/.env
# Edit core-api/.env and voice-agent/.env with your credentials

# Run everything with Docker
./run.sh up          # Linux/Mac
.\run.ps1 up         # Windows PowerShell

# Check status
./run.sh status
```

### Services
- Core API: http://localhost:3000
- Geo Service: http://localhost:8081
- Voice Agent: http://localhost:4000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Run Scripts

**Linux/Mac (`run.sh`):**
```bash
./run.sh up          # Start all services (Docker)
./run.sh down        # Stop all services
./run.sh restart     # Rebuild and restart
./run.sh logs        # Follow all logs
./run.sh logs core-api   # Follow specific service logs
./run.sh status      # Show status + health checks
./run.sh dev-core    # Run Core API locally (Node.js)
./run.sh dev-geo     # Run Geo Service locally (Go)
./run.sh dev-voice   # Run Voice Agent locally (Node.js)
```

**Windows PowerShell (`run.ps1`):**
```powershell
.\run.ps1 up
.\run.ps1 logs core-api
.\run.ps1 status
.\run.ps1 dev-core
```

### Local Development
```bash
# Core API
cd core-api && npm install && npm run dev

# Geo Service
cd geo-service && go run .

# Voice Agent
cd voice-agent && npm install && npm run dev
```

---

## Project Structure

```
visava/
├── docker-compose.yml
├── run.sh                         # Linux/Mac runner
├── run.ps1                        # Windows runner
├── .env.example
├── .gitignore
├── AGENT.md                       # ← You are here
├── TECHNICAL-PLAN.md              # Architecture decisions
├── CORE-API.md                    # Core API documentation
├── GEO-SERVICE.md                 # Geo Service documentation
├── VOICE-AGENT.md                 # Voice Agent documentation
│
├── core-api/                      # Node.js + Express + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── src/
│       ├── index.ts               # Express app + HTTP server
│       ├── config/                # env.ts, database.ts, socket.ts
│       ├── models/                # User, Wari, Camp, Service, Report (Mongoose)
│       ├── routes/                # auth, users, waris, camps, services, reports
│       ├── schemas/               # Zod validation
│       ├── services/              # otp.ts, auth.ts, geoClient.ts
│       ├── middleware/            # auth, validate, errorHandler, requestLogger
│       ├── types/                 # Shared TypeScript types
│       └── utils/                 # AppError, logger
│
├── geo-service/                   # Go + chi + Redis GEO
│   ├── go.mod
│   ├── main.go
│   ├── Dockerfile
│   └── internal/
│       ├── config/                # Environment loading
│       ├── handler/               # location, geo, health
│       ├── service/               # location (Redis GEO), geo, pubsub
│       ├── model/                 # Data structures
│       ├── middleware/            # logging, CORS
│       └── ws/                    # WebSocket hub
│
└── voice-agent/                   # Node.js + Vapi voice AI
    ├── package.json
    ├── tsconfig.json
    ├── Dockerfile
    └── src/
        ├── index.ts               # Express server (Vapi tool webhooks)
        ├── server.ts              # Entry point
        ├── config/                # env.ts
        ├── services/
        │   └── coreApi.ts         # Core API client
        ├── types/                 # VapiToolCallRequest/Response, args types
        └── utils/                 # logger
```

---

## Documentation

| File | What It Covers |
|------|----------------|
| **AGENT.md** | Full system overview, architecture, all API endpoints, conversation flow |
| **TECHNICAL-PLAN.md** | Architecture decisions, tech choices, infrastructure rationale |
| **CORE-API.md** | Core API endpoints, data models, auth flow, confirmation gate |
| **GEO-SERVICE.md** | Geo Service API, Redis GEO internals, WebSocket hub, fan-out flow |
| **VOICE-AGENT.md** | Vapi tool webhooks, assistant setup, phone number config |

---

## Key Decisions

1. **Vapi** for voice — a managed voice AI platform that handles STT, LLM, and TTS in one service. Voice Agent becomes a thin webhook server for tool calls.
2. **Marathi-first** — default language is Marathi (mr-IN), with Hindi and English as options
3. **WebSocket for voice** — Conversation Relay uses WebSocket for real-time bidirectional communication
4. **Intent-based routing** — keyword matching for Marathi/Hindi/English to detect caller intent
5. **Core API as single source of truth** — voice agent delegates all data operations to Core API
6. **Geo Service for location** — radius queries computed in Go with Redis GEO, sub-second even at scale
