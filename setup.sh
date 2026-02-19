#!/bin/bash

# GridX Setup Script
# Quick setup for development environment

set -e

echo "🚀 GridX Setup Script"
echo "=================="
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not installed. Install from https://nodejs.org"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 not installed. Install from https://python.org"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not installed. Install from https://docker.com"
        exit 1
    fi
    
    echo "✓ All prerequisites found"
}

# Setup backend
setup_backend() {
    echo ""
    echo "📦 Setting up Backend..."
    cd gridx-backend
    
    npm install
    echo "✓ Backend dependencies installed"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✓ Created .env file"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    echo ""
    echo "🎨 Setting up Frontend..."
    cd gridx-frontend
    
    npm install
    echo "✓ Frontend dependencies installed"
    
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        echo "✓ Created .env.local file"
    fi
    
    cd ..
}

# Setup AI service
setup_ai() {
    echo ""
    echo "🤖 Setting up AI Service..."
    cd gridx-ai
    
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✓ AI service dependencies installed"
    
    cd ..
}

# Start services
start_services() {
    echo ""
    echo "Starting services with Docker Compose..."
    docker-compose up --build -d
    
    echo ""
    echo "✅ All services started!"
    echo ""
    echo "Services running:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:3001"
    echo "  AI:        http://localhost:8000"
    echo "  Database:  localhost:5432"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop: docker-compose down"
}

# Main
main() {
    check_prerequisites
    setup_backend
    setup_frontend
    setup_ai
    start_services
}

main
