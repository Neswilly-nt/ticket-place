# Ticket Place Deployment Script
# This script deploys the entire application using Docker Compose

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$Rebuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs
)

Write-Host "Starting Ticket Place deployment..." -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check if Docker is running
try {
    docker version > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host ".env file created. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host ".env.example file not found." -ForegroundColor Red
        exit 1
    }
}

# Stop existing containers if rebuild is requested
if ($Rebuild) {
    Write-Host "Stopping existing containers..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    docker system prune -f
}

# Build and start containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow

if ($Environment -eq "prod") {
    docker-compose --profile production up --build -d
} else {
    docker-compose up --build -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start containers." -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "Checking service status..." -ForegroundColor Yellow

$services = @("mysql", "backend", "frontend")
foreach ($service in $services) {
    $status = docker-compose ps -q $service | ForEach-Object { docker inspect --format='{{.State.Health.Status}}' $_ } 2>$null
    if ($status -eq "healthy") {
        Write-Host "$service is healthy" -ForegroundColor Green
    } elseif ($status -eq "starting") {
        Write-Host "$service is starting..." -ForegroundColor Yellow
    } else {
        Write-Host "$service is not healthy" -ForegroundColor Red
    }
}

# Show logs if requested
if ($Logs) {
    Write-Host "Showing logs..." -ForegroundColor Yellow
    docker-compose logs -f
}

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan

if ($Environment -eq "prod") {
    Write-Host "Production (with Nginx): http://localhost" -ForegroundColor Cyan
}
