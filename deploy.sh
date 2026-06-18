#!/bin/bash

# Quick Deployment Script for Docker

set -e

echo "🚀 Xeno Project - Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Install from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Build images
echo ""
echo "📦 Building Docker images..."
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Start containers
echo ""
echo "🐳 Starting containers..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers started${NC}"
else
    echo -e "${RED}❌ Failed to start containers${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Health check
echo ""
echo "🏥 Health check..."

# Check backend
if curl -f http://localhost:5001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:5001${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Upload a CSV file"
echo "3. Monitor logs: docker-compose logs -f"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""
