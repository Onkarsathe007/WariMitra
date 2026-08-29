#!/usr/bin/env bash
set -e

# ============================================================
# Visava - Single Command Local Dev Server
# ============================================================

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js."
    exit 1
fi

# Check if go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Error: go is not installed. Please install Golang."
    exit 1
fi

echo "🚀 Starting Visava Multi-Agent Pipeline (All Services)..."
echo "Press Ctrl+C at any time to gracefully shut down all services."
echo "------------------------------------------------------------"

echo "📦 Starting Redis via Docker (Required by geo-service)..."
# Using raw docker since docker-compose is not installed. Using sudo due to Docker permissions.
if ! sudo docker ps -q -f name=visava-redis | grep -q .; then
    echo "Redis is not running. Attempting to start container..."
    if sudo docker ps -aq -f status=exited -f name=visava-redis | grep -q .; then
        echo "Removing exited Redis container..."
        sudo docker rm visava-redis
    fi
    echo "Starting new Redis container..."
    sudo docker run -d --name visava-redis -p 127.0.0.1:6379:6379 redis:7-alpine
    echo "⏳ Waiting 4 seconds for Redis to initialize..."
    sleep 4
else
    echo "✅ Redis container is already running."
fi

echo "------------------------------------------------------------"

# Using 'concurrently' to run all 4 services in the same terminal with beautiful colored prefixes!
# -k kills all processes if one dies or if you press Ctrl+C
# -n names the prefixes
# -c sets the colors

npx concurrently -k \
  -p "[{name}]" \
  -n "DATABASE ,VOICE-BOT,FRONTEND ,GEO-TRACK" \
  -c "bgBlue.bold,bgMagenta.bold,bgGreen.bold,bgYellow.bold" \
  "cd core-api && npm run dev" \
  "cd voice-agent && npm run dev" \
  "cd frontend && npm run dev" \
  "cd geo-service && go run main.go"
