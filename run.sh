#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Visava - Development Environment Runner
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║              विसवा - Visava                     ║"
    echo "║   Connecting Varkaris with Help in Real Time    ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed.${NC}"
        exit 1
    fi

    for svc in core-api geo-service voice-agent; do
        if [ ! -f "$svc/.env" ]; then
            echo -e "${YELLOW}No $svc/.env found. Creating from $svc/.env.example...${NC}"
            cp "$svc/.env.example" "$svc/.env"
        fi
    done
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
    echo -e "${GREEN}Env files ready — edit core-api/.env and voice-agent/.env with your Twilio credentials.${NC}"

    echo -e "${GREEN}Prerequisites OK${NC}"
}

cmd_up() {
    check_prerequisites
    echo -e "${BLUE}Starting all services...${NC}"
    docker compose up --build -d
    echo ""
    echo -e "${GREEN}All services started!${NC}"
    echo ""
    echo -e "${CYAN}Services:${NC}"
    echo -e "  Core API:    http://localhost:3000"
    echo -e "  Geo Service: http://localhost:8081"
    echo -e "  Voice Agent: http://localhost:4000"
    echo -e "  MongoDB:     localhost:27017"
    echo -e "  Redis:       localhost:6379"
    echo ""
    echo -e "${YELLOW}Logs: ./run.sh logs${NC}"
    echo -e "${YELLOW}Stop: ./run.sh down${NC}"
}

cmd_down() {
    echo -e "${BLUE}Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}All services stopped.${NC}"
}

cmd_logs() {
    if [ -n "${1:-}" ]; then
        docker compose logs -f "$1"
    else
        docker compose logs -f
    fi
}

cmd_status() {
    echo -e "${CYAN}Service Status:${NC}"
    docker compose ps
    echo ""
    echo -e "${CYAN}Health Checks:${NC}"
    for port in 3000 8081 4000; do
        if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Port $port: healthy"
        else
            echo -e "  ${RED}✗${NC} Port $port: not responding"
        fi
    done
}

cmd_rebuild() {
    echo -e "${BLUE}Rebuilding and restarting...${NC}"
    docker compose down
    docker compose up --build -d
    echo -e "${GREEN}Rebuilt and restarted.${NC}"
}

cmd_dev_core() {
    echo -e "${BLUE}Starting Core API in dev mode...${NC}"
    cd core-api
    if [ ! -d node_modules ]; then
        npm install
    fi
    npm run dev
}

cmd_dev_geo() {
    echo -e "${BLUE}Starting Geo Service in dev mode...${NC}"
    cd geo-service
    go run .
}

cmd_dev_voice() {
    echo -e "${BLUE}Starting Voice Agent in dev mode...${NC}"
    cd voice-agent
    if [ ! -d node_modules ]; then
        npm install
    fi
    npm run dev
}

cmd_help() {
    print_banner
    echo "Usage: ./run.sh <command>"
    echo ""
    echo "Commands:"
    echo "  up          Start all services (Docker)"
    echo "  down        Stop all services"
    echo "  restart     Rebuild and restart all services"
    echo "  logs        Follow logs (optionally: logs core-api)"
    echo "  status      Show service status and health checks"
    echo "  dev-core    Run Core API locally (Node.js)"
    echo "  dev-geo     Run Geo Service locally (Go)"
    echo "  dev-voice   Run Voice Agent locally (Node.js)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh up              # Start everything with Docker"
    echo "  ./run.sh logs core-api   # Follow Core API logs"
    echo "  ./run.sh status          # Check all services"
    echo "  ./run.sh dev-core        # Run Core API locally"
}

case "${1:-help}" in
    up)       cmd_up ;;
    down)     cmd_down ;;
    restart)  cmd_rebuild ;;
    logs)     cmd_logs "${2:-}" ;;
    status)   cmd_status ;;
    dev-core) cmd_dev_core ;;
    dev-geo)  cmd_dev_geo ;;
    dev-voice) cmd_dev_voice ;;
    help|*)   cmd_help ;;
esac
