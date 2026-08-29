# Visava — Technical Plan

One decision per layer. No menus, no "you could also use X" — this is what we build.

---

## 1. Theme & Visual Direction

**Direction:** warm, rooted, trustworthy — not a generic tech-startup look. This is a safety tool for pilgrims, so it should feel calm and institutional, like something you'd trust in an emergency, while still nodding to the Wari itself (saffron flags, warkari attire, Pandharpur's pataka banners).

- **Primary color:** deep saffron/turmeric orange (`#D97706`-ish) — for primary actions, active states, the Wari's own iconography
- **Secondary:** deep maroon/earthy red — reserved for alerts (missing person, emergency)
- **Neutral base:** warm off-white / cream, not stark white — easier on the eyes for long outdoor phone use, and low-glare
- **Typography:** one clean, highly legible sans-serif with strong Devanagari support (since most content is in Marathi) — Noto Sans Devanagari paired with a matching Latin sans
- **Icons over illustrations:** simple line icons (medical cross, food bowl, missing-person, found-item) — must read instantly at small size, since users are glancing at this while walking
- **No decorative clutter.** High information density, big tap targets, strong contrast — this has to work in bright sunlight on a cracked phone screen.

---

## 2. Architecture — Single Decision

**Backend split into two services, not one monolith:**

- **Core API (Node.js + Express, TypeScript)** — owns everything CRUD: users, camps/services, Waris, reports, auth. This is the "business logic" service.
- **Geo Service (Go)** — owns everything high-frequency and location-heavy: ingesting live location pings from thousands of concurrent Varkaris, radius queries ("who is near this alert"), and fan-out target computation. Go is chosen here specifically because this is the one part of the system with real concurrent load (a Wari can have lakhs of people, many pinging location every few seconds) — Node's single-threaded event loop is the wrong tool for that volume of tight numeric/geo work, Go's goroutines are the right one.

These two talk to each other over internal HTTP/gRPC, not through the client. The client (web app, voice agent) only ever talks to the Core API, which delegates geo-heavy calls to the Geo Service internally.

**Why not a single Node monolith:** it would work at small scale, but this system is built for a specific multi-week, high-concurrency seasonal spike (the Wari), and the location-ingestion path is exactly the kind of workload that degrades a Node event loop first. Splitting it now avoids a rewrite later.

**Why not full microservices (5+ services):** at this stage that's over-engineering — auth, camps, reports, and users don't have different scaling profiles from each other, so they stay together in Core API. Only the genuinely different workload (geo) gets its own service.

---

## 3. Frontend — Web App

- **Framework: React (Vite + TypeScript), a client-rendered SPA — not Next.js.** No server-side rendering step, no Node server to run for the frontend itself; it builds down to static files served from the CDN. Simpler ops (one less moving part in front of the Core API), and Vite's dev/build speed is a real advantage while iterating fast pre-launch. The tradeoff versus Next.js is a slower first paint on very poor connections since there's no server-rendered HTML — mitigated by the PWA shell caching below, so repeat visits are fast even offline-ish.
- **PWA, not native app:** installable to home screen, service worker caches the app shell and map UI for flaky connections, Web Push for notifications. This matches the original decision to not build native apps.
- **Styling:** Tailwind CSS, mobile-first breakpoints only — desktop is an afterthought for this product.
- **Maps:** Leaflet + OpenStreetMap tiles. Chosen over Mapbox/Google Maps specifically to avoid per-request billing at high pilgrim-season traffic and to avoid a vendor API key dependency — OSM tiles are free and self-hostable if we need to cache them later.
- **State/data fetching:** React Query for server state (live locations, alerts) with short polling or WebSocket-driven cache invalidation — see real-time section below.
- **Language:** Marathi as the default UI language, with Hindi and English as switchable options. Marathi first, not last. Font: Noto Sans Devanagari, paired with Noto Sans for Latin text — free, actively maintained by Google, and has the most complete, best-tested Devanagari glyph coverage of any open font, which matters for a product where misrendered Marathi text is a real usability failure, not just a cosmetic one.

---

## 4. Voice Agent (No-Smartphone Path)

- **Telephony:** Twilio Programmable Voice — receives the call, streams audio.
- **Speech-to-text / text-to-speech:** Sarvam AI, not Google/AWS generic STT. Sarvam is built specifically for Indian languages and handles Marathi far more reliably than generic multilingual STT engines, which matters enormously here since call quality + rural accents + Marathi is exactly the hard case generic engines fail on.
- **Agent brain:** Claude (Anthropic API), driving the conversation with tool-calling. The agent has a fixed toolset, not open-ended access to the database:
  - `find_medical_help(location)`
  - `find_food_point(location)`
  - `report_missing_person(details, reporter_phone)`
  - `report_found_item(details, location)`
  - `connect_call(target_phone)` — bridges the live call to a helper/emergency contact
- **Flow control:** every tool call that results in a public alert (missing person, found item) requires a verification step before it fires — e.g., a callback confirmation or a second detail check — to prevent false alarms and spam. This was a gap in the original notes and is a hard requirement, not optional.
- **Fallback:** if Sarvam's STT confidence is low (noisy environment, unclear speech), the agent asks a clarifying question rather than guessing — never silently misroutes a medical emergency.

---

## 5. Database & Caching

- **Primary store: MongoDB (Atlas, managed)** — for all persistent data: users, camps, Wari metadata, reports, service listings. Chosen because the data is naturally document-shaped (a "camp" or "Wari" record has nested, variable fields) and geospatial queries are a first-class MongoDB feature via `2dsphere` indexes.
- **Redis (ElastiCache)** — two distinct jobs, not one:
  1. **Live location cache** — current position of every actively-tracked Varkari/Wari, stored via Redis's native `GEOADD`/`GEORADIUS` commands. This is ephemeral and constantly overwritten — it does not belong in MongoDB, which isn't built for write-heavy, short-lived geo data at this frequency.
  2. **Pub/Sub for alert fan-out** — when the Geo Service computes "who is within 2km of this alert," it publishes to Redis, and the notification worker subscribes and pushes.
- **Rule of thumb:** MongoDB is the system of record (what happened, who reported what). Redis is the system of "right now" (where is everyone, who needs to be notified this second). Nothing permanent lives only in Redis.

---

## 6. Real-Time & Geospatial Layer

- **Live location updates → Geo Service (Go) → Redis GEO.** Smartphone clients send location pings over WebSocket (not repeated HTTP polling — too much overhead at this volume) to the Geo Service, which updates Redis.
- **Map live-update delivery → WebSocket (Socket.IO) from Core API to clients.** The web app subscribes to a room per Wari/region and receives incremental updates, not full re-fetches.
- **Radius queries** (missing person / found item alert targeting) are computed in the Geo Service using Redis `GEORADIUS`, not by scanning MongoDB — this needs to be sub-second even with lakhs of tracked points.

---

## 7. Notifications

- **Smartphone users:** Web Push (via the PWA's service worker) — no third-party push SDK needed, keeps this free and infrastructure-light.
- **Voice-agent / non-smartphone users:** notifications aren't pushed to them at all — by definition they don't have a device to push to. Their "notification" is that the helpline agent can already tell them about anything nearby when they call in. This is a deliberate asymmetry, not a gap.
- **Helpers (service providers):** SMS via Twilio for anything urgent (e.g., "a Varkari nearby needs medical help and is being connected to you now"), since we can't assume they're staring at the web app at all times.

---

## 8. Auth & Verification

- **Phone-number + OTP only, no passwords.** Twilio Verify for OTP delivery. This matches the user base — low literacy with passwords, universal familiarity with OTP-over-SMS.
- **Report verification gate:** any report that triggers a public alert (missing person, found item) goes through a confirmation step (repeat-back confirmation on the call, or a second confirmation tap on web) before it fans out. This is enforced in the Core API, not left to the voice agent's judgement alone.
- **Helper accounts** get a lightweight verification step (phone OTP + the service they're offering) before their listing goes live on the map, to keep the map from being polluted by fake entries.

---

## 9. Infrastructure & Deployment

- **Compute: AWS EKS (Kubernetes), not plain ECS.** The deciding factor is the traffic shape: this system runs at near-zero load most of the year and then faces a massive, predictable multi-week spike during Wari season. Kubernetes' autoscaling (HPA on the Geo Service especially) is the right fit for that pattern, and it lines up with the team's existing Kubernetes/Docker experience — no new tooling to learn under deadline pressure.
- **Containerization:** Docker for every service (Core API, Geo Service, notification worker), one image per service, built via CI.
- **Database:** MongoDB Atlas (managed, cross-region backup) — not self-hosted. Given this handles missing-person data, self-hosting Mongo ourselves during pilgrimage season is an unnecessary operational risk.
- **Cache:** AWS ElastiCache for Redis, in the same VPC as EKS for lowest latency to the Geo Service.
- **CDN:** CloudFront in front of the Next.js static assets and the PWA shell.
- **CI/CD:** GitHub Actions — build, test, containerize, deploy to EKS on merge to main.
- **Secrets/config:** AWS Secrets Manager, injected into pods — no secrets in source or in Docker images.

---

## 10. Build Order

Rough sequencing, so the highest-risk/highest-value pieces get validated first:

1. **Core API + MongoDB schema** — users, camps, Waris, reports (no real-time yet)
2. **Web app shell + map (static data)** — prove the map/PWA experience works before adding live data
3. **Geo Service + Redis + live location tracking** — the hardest technical piece, needs its own focused build and load-test
4. **Voice agent (Twilio + Sarvam + Claude)** — can be built in parallel with (3) once Core API's tool-facing endpoints exist
5. **Notifications (Web Push + SMS)** — wire in once alert-fan-out logic in the Geo Service is solid
6. **Verification flows** — layer on top of reports before any public launch, not after

---

## 11. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Core API** | ✅ Implemented | Express + TypeScript, all CRUD endpoints, JWT auth, Zod validation, Socket.IO |
| **Geo Service** | ✅ Implemented | Go + chi, Redis GEO, WebSocket hub, radius queries, fan-out |
| **Voice Agent** | ✅ Implemented | Twilio Conversation Relay, Marathi/Hindi/English, intent parsing, state machine |
| **Docker Compose** | ✅ Implemented | 5 services: mongodb, redis, core-api, geo-service, voice-agent |
| **Run Scripts** | ✅ Implemented | `run.sh` (Linux/Mac), `run.ps1` (Windows) |
| **Documentation** | ✅ Implemented | AGENT.md, CORE-API.md, GEO-SERVICE.md, VOICE-AGENT.md |
| **Frontend (Web App)** | ⏳ Not started | React + Vite + TypeScript, PWA, Leaflet + OSM |
| **Notification Worker** | ⏳ Not started | Redis Pub/Sub consumer, Web Push, SMS |
| **Kubernetes/EKS** | ⏳ Not started | Production deployment infrastructure |
| **CI/CD Pipeline** | ⏳ Not started | GitHub Actions |

### What's Built vs. What's Planned

**Built (backend complete):**
- All three microservices (Core API, Geo Service, Voice Agent)
- Phone + OTP auth via Twilio Verify
- Mongoose models with 2dsphere geospatial indexes
- Redis GEO for live location tracking and radius queries
- WebSocket hub for real-time location broadcasting
- Conversation Relay voice agent with Marathi/Hindi/English
- Intent-based keyword parsing for 8 intents
- Multi-turn conversation state machine
- Report confirmation gate before alert fan-out
- Docker Compose orchestration with health checks

**Not yet built:**
- Frontend web app (React PWA)
- Notification worker (Redis Pub/Sub → Web Push)
- Production Kubernetes deployment
- CI/CD pipeline
- Load testing
- Monitoring/alerting (Prometheus/Grafana)

---

*Next: schema design, API contracts, and the exact agent tool definitions, whenever you're ready.*
