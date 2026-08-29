# Core API

The central business logic service for Visava. Handles authentication, CRUD operations for all entities, report management with confirmation gates, and real-time WebSocket broadcasting via Socket.IO.

## Tech Stack

- Node.js 22 + Express + TypeScript
- Mongoose (MongoDB ODM)
- Zod (validation)
- Pino (structured logging)
- Socket.IO (real-time updates)
- Twilio Verify (OTP delivery)

## Quick Start

```bash
cd core-api
npm install
cp ../.env.example ../.env
npm run dev
```

Server runs on `http://localhost:3000`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `REDIS_URL` | Yes | — | Redis connection string (used by Geo Service) |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration |
| `TWILIO_ACCOUNT_SID` | Yes | — | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | — | Twilio auth token |
| `TWILIO_VERIFY_SID` | Yes | — | Twilio Verify service SID |
| `GEO_SERVICE_URL` | No | `http://localhost:8081` | Geo Service internal URL |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `NODE_ENV` | No | `development` | `development` or `production` |

## Development Mode

When `NODE_ENV=development`, OTP verification is bypassed — any 6-digit code (or hardcoded `123456`) is accepted. This lets you test the full auth flow without a Twilio account.

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/send-otp` | — | Send OTP to phone number |
| `POST` | `/api/v1/auth/verify-otp` | — | Verify OTP, returns JWT + user |
| `GET` | `/api/v1/auth/me` | JWT | Get current user profile |
| `PATCH` | `/api/v1/auth/me` | JWT | Update user profile |

**Send OTP:**
```json
POST /api/v1/auth/send-otp
{ "phoneNumber": "+919876543210" }
→ { "status": "ok", "message": "OTP sent" }
```

**Verify OTP:**
```json
POST /api/v1/auth/verify-otp
{ "phoneNumber": "+919876543210", "code": "123456" }
→ { "status": "ok", "token": "eyJ...", "user": { "id": "...", "role": "varkari" } }
```

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/users` | Admin | List all users |
| `GET` | `/api/v1/users/:id` | Admin | Get user by ID |
| `PATCH` | `/api/v1/users/:id` | Admin | Update user role/status |

### Waris (Pilgrimage Groups)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/waris` | — | List waris (supports `?lat=&lng=&radius=`) |
| `GET` | `/api/v1/waris/:id` | — | Get wari details |
| `POST` | `/api/v1/waris` | Admin | Create wari |
| `PATCH` | `/api/v1/waris/:id` | Admin | Update wari |

### Camps

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/camps` | — | List camps (supports `?lat=&lng=&radius=&type=`) |
| `GET` | `/api/v1/camps/:id` | — | Get camp details |
| `POST` | `/api/v1/camps` | Helper/Admin | Create camp |
| `PATCH` | `/api/v1/camps/:id` | Owner/Admin | Update camp |

### Services

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/services` | — | List services (supports `?lat=&lng=&radius=&type=`) |
| `GET` | `/api/v1/services/:id` | — | Get service details |
| `POST` | `/api/v1/services` | Helper/Admin | Create service |
| `PATCH` | `/api/v1/services/:id` | Owner/Admin | Update service |
| `DELETE` | `/api/v1/services/:id` | Owner/Admin | Delete service |

### Reports (Missing Person / Found Items)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/reports` | — | List reports (supports `?type=&status=&lat=&lng=&radius=`) |
| `GET` | `/api/v1/reports/:id` | — | Get report details |
| `POST` | `/api/v1/reports` | JWT | Create report (triggers confirmation gate) |
| `PATCH` | `/api/v1/reports/:id/confirm` | Reporter | Confirm report (required before fan-out) |
| `PATCH` | `/api/v1/reports/:id/resolve` | — | Mark report resolved |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{"status": "ok", "timestamp": "...", "uptime": ...}` |

## Data Models

### User
```
{
  phoneNumber: string (unique, indexed)
  role: "varkari" | "helper" | "admin"
  name?: string
  verified: boolean
  timestamps
}
```

### Wari
```
{
  name: string (unique, indexed)
  description?: string
  route: [{ lat, lng, order }]
  startPoint: { lat, lng }
  endPoint: { lat, lng }
  startDate?: Date
  endDate?: Date
  expectedParticipants?: number
  status: "upcoming" | "active" | "completed"
  timestamps
}
```
Indexes: `2dsphere` on `startPoint`, `endPoint`, `route`

### Camp
```
{
  name: string
  type: "medical" | "food" | "water" | "shelter" | "other"
  location: GeoJSON Point (2dsphere indexed)
  address?: string
  description?: string
  contactPhone?: string
  available: boolean
  wariId?: ObjectId (ref Wari)
  createdBy: ObjectId (ref User)
  timestamps
}
```

### Service
```
{
  name: string
  type: "medical" | "food" | "water" | "shelter" | "other"
  location: GeoJSON Point (2dsphere indexed)
  address?: string
  description?: string
  contactPhone?: string
  available: boolean
  offeredBy?: string
  wariId?: ObjectId (ref Wari)
  createdBy: ObjectId (ref User)
  timestamps
}
```

### Report
```
{
  type: "missing_person" | "found_item"
  location: GeoJSON Point (2dsphere indexed)
  description: string
  reporterPhone: string
  status: "pending_confirmation" | "confirmed" | "resolved"
  confirmationCode?: string
  radius?: number (km, default 2)
  confirmedAt?: Date
  resolvedAt?: Date
  timestamps
}
```

## Report Confirmation Gate

Reports go through a two-step flow:

1. **Create** — Report is saved with `status: "pending_confirmation"`. A confirmation code is generated. No alert is sent yet.
2. **Confirm** — Reporter confirms (via phone call or web tap). Status changes to `"confirmed"`. The Core API calls the Geo Service's fan-out endpoint to find nearby users and send alerts.

This prevents false alarms and spam from triggering mass notifications.

## Project Structure

```
core-api/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── index.ts                  # Express app + HTTP server
    ├── config/
    │   ├── env.ts                # Environment variable loading + validation
    │   ├── database.ts           # Mongoose connection
    │   └── socket.ts             # Socket.IO initialization
    ├── models/
    │   ├── User.ts
    │   ├── Wari.ts
    │   ├── Camp.ts
    │   ├── Service.ts
    │   └── Report.ts
    ├── routes/
    │   ├── index.ts              # Router composition
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── waris.ts
    │   ├── camps.ts
    │   ├── services.ts
    │   └── reports.ts
    ├── schemas/                  # Zod validation schemas
    ├── services/
    │   ├── otp.ts                # Twilio Verify integration
    │   ├── auth.ts               # JWT generation/verification
    │   └── geoClient.ts          # HTTP client for Geo Service
    ├── middleware/
    │   ├── auth.ts               # JWT authentication
    │   ├── validate.ts           # Zod request validation
    │   ├── errorHandler.ts       # Global error handler
    │   └── requestLogger.ts      # Pino request logging + request ID
    ├── types/                    # Shared TypeScript interfaces
    └── utils/
        ├── AppError.ts           # Custom error classes
        └── logger.ts             # Pino logger
```

## Building & Running

```bash
# Development
npm run dev

# Build
npx tsc --noEmit    # Type check
npm run build        # Compile

# Docker
docker build -t visava-core-api .
docker run -p 3000:3000 visava-core-api
```
