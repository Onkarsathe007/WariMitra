<#
.SYNOPSIS
    Visava - Development Environment Runner

.DESCRIPTION
    Starts, stops, and manages all Visava microservices.

.PARAMETER Command
    The action to perform: up, down, restart, logs, status, dev-core, dev-geo, dev-voice, help

.EXAMPLE
    .\run.ps1 up              # Start all services with Docker
    .\run.ps1 logs core-api   # Follow Core API logs
    .\run.ps1 status          # Check all services
    .\run.ps1 dev-core        # Run Core API locally
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet("up", "down", "restart", "logs", "status", "dev-core", "dev-geo", "dev-voice", "help")]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$ServiceName = ""
)

$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              विसवा - Visava                     ║" -ForegroundColor Cyan
    Write-Host "║   Connecting Varkaris with Help in Real Time    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Blue

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "Error: Docker is not installed." -ForegroundColor Red
        Write-Host "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    }

    foreach ($svc in @("core-api", "geo-service", "voice-agent")) {
        if (-not (Test-Path "$svc/.env")) {
            Write-Host "No $svc/.env found. Creating from $svc/.env.example..." -ForegroundColor Yellow
            Copy-Item "$svc/.env.example" "$svc/.env"
        }
    }
    if (-not (Test-Path .env)) {
        Copy-Item .env.example .env
    }
    Write-Host "Env files ready — edit core-api/.env and voice-agent/.env with your Twilio credentials." -ForegroundColor Green

    Write-Host "Prerequisites OK" -ForegroundColor Green
}

function Start-Services {
    Test-Prerequisites
    Write-Host "Starting all services..." -ForegroundColor Blue
    docker compose up --build -d
    Write-Host ""
    Write-Host "All services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  Core API:    http://localhost:3000"
    Write-Host "  Geo Service: http://localhost:8081"
    Write-Host "  Voice Agent: http://localhost:4000"
    Write-Host "  MongoDB:     localhost:27017"
    Write-Host "  Redis:       localhost:6379"
    Write-Host ""
    Write-Host "Logs: .\run.ps1 logs" -ForegroundColor Yellow
    Write-Host "Stop: .\run.ps1 down" -ForegroundColor Yellow
}

function Stop-Services {
    Write-Host "Stopping all services..." -ForegroundColor Blue
    docker compose down
    Write-Host "All services stopped." -ForegroundColor Green
}

function Show-Logs {
    param([string]$Service)
    if ($Service) {
        docker compose logs -f $Service
    } else {
        docker compose logs -f
    }
}

function Show-Status {
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker compose ps
    Write-Host ""
    Write-Host "Health Checks:" -ForegroundColor Cyan

    $ports = @(
        @{ Port = 3000; Name = "Core API" },
        @{ Port = 8081; Name = "Geo Service" },
        @{ Port = 4000; Name = "Voice Agent" }
    )

    foreach ($svc in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-Host "  ✓ $($svc.Name) (port $($svc.Port)): healthy" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $($svc.Name) (port $($svc.Port)): not responding" -ForegroundColor Red
        }
    }
}

function Restart-Services {
    Write-Host "Rebuilding and restarting..." -ForegroundColor Blue
    docker compose down
    docker compose up --build -d
    Write-Host "Rebuilt and restarted." -ForegroundColor Green
}

function Start-DevCore {
    Write-Host "Starting Core API in dev mode..." -ForegroundColor Blue
    Push-Location core-api
    if (-not (Test-Path node_modules)) { npm install }
    npm run dev
    Pop-Location
}

function Start-DevGeo {
    Write-Host "Starting Geo Service in dev mode..." -ForegroundColor Blue
    Push-Location geo-service
    go run .
    Pop-Location
}

function Start-DevVoice {
    Write-Host "Starting Voice Agent in dev mode..." -ForegroundColor Blue
    Push-Location voice-agent
    if (-not (Test-Path node_modules)) { npm install }
    npm run dev
    Pop-Location
}

function Show-Help {
    Write-Banner
    Write-Host "Usage: .\run.ps1 <command>"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  up          Start all services (Docker)"
    Write-Host "  down        Stop all services"
    Write-Host "  restart     Rebuild and restart all services"
    Write-Host "  logs        Follow logs (optionally: logs core-api)"
    Write-Host "  status      Show service status and health checks"
    Write-Host "  dev-core    Run Core API locally (Node.js)"
    Write-Host "  dev-geo     Run Geo Service locally (Go)"
    Write-Host "  dev-voice   Run Voice Agent locally (Node.js)"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run.ps1 up              # Start everything with Docker"
    Write-Host "  .\run.ps1 logs core-api   # Follow Core API logs"
    Write-Host "  .\run.ps1 status          # Check all services"
    Write-Host "  .\run.ps1 dev-core        # Run Core API locally"
}

switch ($Command) {
    "up"        { Start-Services }
    "down"      { Stop-Services }
    "restart"   { Restart-Services }
    "logs"      { Show-Logs -Service $ServiceName }
    "status"    { Show-Status }
    "dev-core"  { Start-DevCore }
    "dev-geo"   { Start-DevGeo }
    "dev-voice" { Start-DevVoice }
    default     { Show-Help }
}
