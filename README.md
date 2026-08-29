# WariMitra (Visava)

**Connecting Varkaris with Help in Real Time**

An AI-powered voice agent system that provides real-time assistance to people in need during emergencies and pilgrimages. The system uses voice AI to help users find nearby services, report missing persons, and access emergency resources in Marathi and English.

## Features

- 🎙️ **AI Voice Agent** - Natural language voice interface for hands-free assistance
- 🗺️ **Location Services** - Find nearby shelters, hospitals, and emergency services
- 📱 **Real-time Communication** - Instant responses via WebSocket connections
- 🌐 **Multi-language Support** - Marathi and English language support
- 🔒 **Secure Authentication** - JWT-based authentication system
- 📊 **Analytics Dashboard** - Monitor usage and service metrics
- 🐳 **Docker Ready** - Complete containerized setup for easy deployment

## Tech Stack

### Backend
- **Core API**: Node.js + Express + TypeScript
- **Geo Service**: Go + Redis caching
- **Voice Agent**: Node.js + WebSocket + Vapi AI
- **Database**: MongoDB Atlas (Cloud)
- **Cache**: Redis 7.0

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **UI Library**: Leaflet for maps, Lucide for icons
- **Styling**: Tailwind CSS

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Process Manager**: Concurrently (local dev)

## Project Structure

```
WariMitra/
├── core-api/           # Backend API server
│   ├── src/           # TypeScript source code
│   ├── Dockerfile     # Docker configuration
│   └── .env.example   # Environment variables template
├── geo-service/        # Geographic service (Go)
│   ├── internal/      # Go packages
│   ├── main.go        # Entry point
│   └── Dockerfile     # Docker configuration
├── voice-agent/        # Voice AI agent
│   ├── src/           # TypeScript source code
│   ├── Dockerfile     # Docker configuration
│   └── .env.example   # Environment variables template
├── frontend/           # React web application
│   ├── src/           # React components
│   ├── Dockerfile     # Docker configuration
│   └── nginx.conf     # Nginx configuration
├── docker-compose.yml  # Docker orchestration
├── start.sh           # Centralized startup script
└── README.md          # This file
```

**Note:** MongoDB is hosted on MongoDB Atlas (cloud). Connection details are in `core-api/.env`.

## Prerequisites

### For Docker Setup (Recommended)
- **Docker** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ ([Install Compose](https://docs.docker.com/compose/install/))
- **Git** ([Install Git](https://git-scm.com/downloads))

### For Local Development
- **Node.js** 18+ ([Install Node.js](https://nodejs.org/))
- **Go** 1.21+ ([Install Go](https://golang.org/dl/))
- **Redis** 7.0+ (or use Docker)
- **npm** or **pnpm** ([Install npm](https://www.npmjs.com/get-npm))

## Quick Start

### Option 1: Docker Setup (Recommended)

The easiest way to get started. This sets up all services with a single command.

```bash
# Clone the repository
git clone <repository-url>
cd WariMitra

# Copy environment files
cp .env.example .env
cp core-api/.env.example core-api/.env
cp voice-agent/.env.example voice-agent/.env
cp geo-service/.env.example geo-service/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your credentials
# At minimum, update core-api/.env and voice-agent/.env

# Start all services
./start.sh up
```

**Services will be available at:**
- Frontend: http://localhost:80
- Core API: http://localhost:3000
- Geo Service: http://localhost:8081
- Voice Agent: http://localhost:4000
- Redis: localhost:6379
- MongoDB: Cloud (MongoDB Atlas)

### Option 2: Local Development

Run services locally without Docker (requires Node.js, Go, MongoDB, Redis).

```bash
# Clone the repository
git clone <repository-url>
cd WariMitra

# Copy environment files
cp .env.example .env
cp core-api/.env.example core-api/.env
cp voice-agent/.env.example voice-agent/.env
cp geo-service/.env.example geo-service/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your credentials

# Start all services locally
./start.sh up --local
```

This uses `concurrently` to run all services in a single terminal with color-coded output.

## Environment Variables

### Core API (`core-api/.env`)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/visava?retryWrites=true&w=majority
REDIS_URL=redis://redis:6379
GEO_SERVICE_URL=http://geo-service:8081
JWT_SECRET=your_jwt_secret_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Voice Agent (`voice-agent/.env`)

```env
PORT=4000
CORE_API_URL=http://core-api:3000
INTERNAL_API_KEY=your_internal_api_key
VAPI_API_KEY=your_vapi_api_key
```

### Geo Service (`geo-service/.env`)

```env
PORT=8081
REDIS_URL=redis://redis:6379
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:4000
```

## Development

### Running Individual Services

```bash
# Core API only
./start.sh dev-core

# Geo Service only
./start.sh dev-geo

# Voice Agent only
./start.sh dev-voice
```

### Building for Production

```bash
# Build all Docker images
docker compose build

# Build specific service
docker compose build core-api
docker compose build geo-service
docker compose build voice-agent
docker compose build frontend
```

### Viewing Logs

```bash
# All services
./start.sh logs

# Specific service
./start.sh logs core-api
./start.sh logs voice-agent
```

### Service Status

```bash
./start.sh status
```

## API Endpoints

### Core API (port 3000)

- `GET /health` - Health check
- `GET /api/v1/camps` - List all camps
- `GET /api/v1/services` - List all services
- `POST /api/v1/reports` - Create a report
- `GET /api/v1/services/nearby` - Find nearby services

### Geo Service (port 8081)

- `GET /health` - Health check
- `POST /api/v1/geo/translate` - Translate location to coordinates
- `GET /api/v1/geo/nearby` - Find nearby locations

### Voice Agent (port 4000)

- `GET /health` - Health check
- `POST /api/v1/voice/tools` - Vapi tool endpoint
- `WS /ws` - WebSocket connection for real-time communication

## Voice AI Setup

### Vapi Configuration

1. Create a Vapi account at [vapi.ai](https://vapi.ai)
2. Import the assistant configuration from `vapi-assistant-config.json`
3. Set up an Ngrok tunnel to expose your local voice agent:

```bash
# Start Ngrok tunnel
ngrok http --url=your-static-domain.ngrok-free.dev 4000
```

4. Update the Vapi assistant configuration with your Ngrok URL
5. Set transcriber to Deepgram (Nova-2, Language: hi)
6. Set LLM model to GPT-4o

### How It Works

1. User speaks to Vapi (e.g., "Find a shelter near Pandharpur")
2. Vapi triggers the `find_nearby_services` tool
3. Voice Agent receives the request via Ngrok
4. Voice Agent translates location to coordinates using Geo Service
5. Voice Agent queries Core API for nearby services
6. Voice Agent formats and returns the response to Vapi
7. AI reads the result back to the user in Marathi/English

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process
kill -9 <PID>
```

**Docker build fails:**
```bash
# Clean Docker cache
docker system prune -a
# Rebuild
docker compose build --no-cache
```

**MongoDB connection refused:**
```bash
# Check your MongoDB Atlas connection string in core-api/.env
# Ensure your IP is whitelisted in MongoDB Atlas
# Verify network access in MongoDB Atlas dashboard
```

**Redis connection refused:**
```bash
# Check if Redis is running
docker compose ps redis
# Check logs
docker compose logs redis
```

### Resetting Everything

```bash
# Stop all services and remove volumes
docker compose down -v

# Remove all images
docker system prune -a

# Start fresh
./start.sh up
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Use conventional commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join conversations in GitHub Discussions

## Acknowledgments

- Built with ❤️ for the Varkari community
- Powered by Vapi AI for voice interactions
- Uses Cloudflare for infrastructure
- Map data from OpenStreetMap
