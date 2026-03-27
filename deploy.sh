#!/bin/bash

# Ticket Place Deployment Script
# This script deploys the entire application using Docker Compose

set -e

# Default values
ENVIRONMENT="dev"
REBUILD=false
SHOW_LOGS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--env dev|prod] [--rebuild] [--logs]"
            echo "  --env      Set environment (default: dev)"
            echo "  --rebuild  Rebuild all containers from scratch"
            echo "  --logs     Show logs after deployment"
            echo "  --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🚀 Starting Ticket Place deployment..."
echo "Environment: $ENVIRONMENT"

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created. Please update it with your configuration."
    else
        echo "❌ .env.example file not found."
        exit 1
    fi
fi

# Stop existing containers if rebuild is requested
if [ "$REBUILD" = true ]; then
    echo "🔄 Stopping existing containers..."
    docker-compose down --remove-orphans
    docker system prune -f
fi

# Build and start containers
echo "🔨 Building and starting containers..."

if [ "$ENVIRONMENT" = "prod" ]; then
    docker-compose --profile production up --build -d
else
    docker-compose up --build -d
fi

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
echo "🔍 Checking service status..."

services=("mysql" "backend" "frontend")
for service in "${services[@]}"; do
    status=$(docker-compose ps -q "$service" | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    if [ "$status" = "healthy" ]; then
        echo "✅ $service is healthy"
    elif [ "$status" = "starting" ]; then
        echo "⏳ $service is starting..."
    else
        echo "❌ $service is not healthy"
    fi
done

# Show logs if requested
if [ "$SHOW_LOGS" = true ]; then
    echo "📋 Showing logs..."
    docker-compose logs -f
fi

echo "🎉 Deployment completed!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8080"
echo "📍 API Documentation: http://localhost:8080/swagger-ui.html"

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "📍 Production (with Nginx): http://localhost"
fi
