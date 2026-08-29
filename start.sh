#!/usr/bin/env bash
set -euo pipefail

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

log_info()    { echo -e "${BLUE}ℹ $1${NC}"; }
log_success() { echo -e "${GREEN}✓ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }
log_error()   { echo -e "${RED}✗ $1${NC}"; }

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        echo "Install: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null 2>&1; then
        log_error "Docker daemon is not running"
        echo "Start Docker and try again"
        exit 1
    fi

    if ! docker compose version &> /dev/null 2>&1; then
        log_error "Docker Compose is not installed"
        echo "Install: https://docs.docker.com/compose/install/"
        exit 1
    fi

    log_success "Docker is ready"
}

setup_env_files() {
    log_info "Setting up environment files..."

    for svc in core-api geo-service voice-agent frontend; do
        if [ ! -f "$svc/.env" ]; then
            if [ -f "$svc/.env.example" ]; then
                cp "$svc/.env.example" "$svc/.env"
                log_warn "Created $svc/.env from example"
            else
                touch "$svc/.env"
                log_warn "Created empty $svc/.env"
            fi
        fi
    done

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
        else
            touch .env
        fi
    fi

    log_success "Environment files ready"
}

pull_images() {
    log_info "Pulling base images from Docker Hub..."

    local images=(
        "redis:7-alpine"
        "node:22-alpine"
        "golang:1.22-alpine"
        "alpine:3.19"
        "nginx:alpine"
    )

    for image in "${images[@]}"; do
        if docker image inspect "$image" &> /dev/null 2>&1; then
            log_success "Image already present: $image"
        else
            log_info "Pulling: $image"
            if docker pull "$image"; then
                log_success "Pulled: $image"
            else
                log_warn "Failed to pull: $image (will build locally)"
            fi
        fi
    done
}

build_images() {
    log_info "Building application images..."

    local services=("core-api" "geo-service" "voice-agent" "frontend")

    for service in "${services[@]}"; do
        if [ -f "$service/Dockerfile" ]; then
            log_info "Building $service..."
            if docker compose build "$service" 2>&1; then
                log_success "Built: $service"
            else
                log_error "Failed to build: $service"
                exit 1
            fi
        fi
    done
}

check_ports() {
    log_info "Checking port availability..."

    local ports=(80 3000 4000 4001 8081 6379)
    local busy_ports=()

    for port in "${ports[@]}"; do
        if ss -tlnp 2>/dev/null | grep -q ":${port} " || netstat -tlnp 2>/dev/null | grep -q ":${port} "; then
            busy_ports+=("$port")
        fi
    done

    if [ ${#busy_ports[@]} -gt 0 ]; then
        log_warn "These ports are in use: ${busy_ports[*]}"
        echo ""
        echo "Options:"
        echo "  1. Stop conflicting services"
        echo "  2. Change ports in docker-compose.yml"
        echo "  3. Continue anyway (services may fail to start)"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "All ports available"
    fi
}

start_services() {
    log_info "Starting all services..."

    docker compose up -d

    log_success "All services started!"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                  SERVICES                       ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  Frontend:    http://localhost:80                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Core API:    http://localhost:3000              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Geo Service: http://localhost:8081              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Voice Agent: http://localhost:4000              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Redis:       localhost:6379                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  MongoDB:     Cloud (Atlas)                     ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Logs:    ./start.sh logs${NC}"
    echo -e "${YELLOW}Stop:    ./start.sh down${NC}"
    echo -e "${YELLOW}Status:  ./start.sh status${NC}"
}

wait_for_service() {
    local service=$1
    local port=$2
    local timeout=${3:-30}

    local count=0
    while [ $count -lt $timeout ]; do
        if docker compose exec -T "$service" curl -sf "http://localhost:$port/health" &> /dev/null; then
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    return 1
}

cmd_up() {
    print_banner

    check_docker
    setup_env_files
    pull_images
    build_images
    check_ports
    start_services
}

cmd_down() {
    log_info "Stopping all services..."
    docker compose down
    log_success "All services stopped"
}

cmd_restart() {
    log_info "Restarting all services..."
    docker compose down
    docker compose up -d
    log_success "All services restarted"
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

    echo -e "${CYAN}Port Status:${NC}"
    local services=(
        "frontend:80"
        "core-api:3000"
        "geo-service:8081"
        "voice-agent:4000"
    )

    for svc in "${services[@]}"; do
        IFS=':' read -r service port <<< "$svc"
        if docker compose exec -T "$service" curl -sf "http://localhost:$port/health" &> /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $service (port $port): healthy"
        else
            echo -e "  ${RED}✗${NC} $service (port $port): not responding"
        fi
    done
}

cmd_build() {
    log_info "Building all services..."
    docker compose build --no-cache
    log_success "All services built"
}

cmd_clean() {
    log_info "Cleaning up Docker resources..."
    docker compose down -v --rmi local
    docker system prune -f
    log_success "Cleanup complete"
}

cmd_help() {
    print_banner
    echo "Usage: ./start.sh <command>"
    echo ""
    echo "Commands:"
    echo "  up          Pull images, build, and start all services"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Follow logs (optionally: logs core-api)"
    echo "  status      Show service status and health checks"
    echo "  build       Rebuild all Docker images"
    echo "  clean       Remove all containers, volumes, and images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh up              # Start everything"
    echo "  ./start.sh logs core-api   # Follow Core API logs"
    echo "  ./start.sh status          # Check all services"
    echo "  ./start.sh clean           # Clean up everything"
}

case "${1:-help}" in
    up)       cmd_up ;;
    down)     cmd_down ;;
    restart)  cmd_restart ;;
    logs)     cmd_logs "${2:-}" ;;
    status)   cmd_status ;;
    build)    cmd_build ;;
    clean)    cmd_clean ;;
    help|*)   cmd_help ;;
esac
