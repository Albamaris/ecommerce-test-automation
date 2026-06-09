#!/bin/bash

# E-Commerce - Jenkins Setup Script
# This script starts Jenkins with Docker Compose and displays the initial admin password

set -e

echo "========================================="
echo "  Jenkins Setup for Playwright Testing  "
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Start Jenkins with Docker Compose
echo "🚀 Starting Jenkins..."
docker compose up -d

echo ""
echo "⏳ Waiting for Jenkins to start (this may take 30-60 seconds)..."
sleep 30

# Get the initial admin password
echo ""
echo "========================================="
echo "  Jenkins is starting!                   "
echo "========================================="
echo ""
echo "📍 Jenkins URL: http://localhost:8080"
echo ""
echo "🔑 Initial Admin Password:"
echo "========================================="

if docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
    echo "========================================="
else
    echo "⚠️  Password not yet available. Jenkins is still starting."
    echo "Wait a few more seconds and run:"
    echo "docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword"
fi

echo ""
echo "📚 Next Steps:"
echo "1. Open http://localhost:8080 in your browser"
echo "2. Enter the initial admin password shown above"
echo "3. Install suggested plugins"
echo "4. Create your first admin user"
echo "5. Follow the Jenkins setup guide in docs/JENKINS_SETUP.md"
echo ""
echo "To stop Jenkins:"
echo "  docker compose down"
echo ""
echo "To view logs:"
echo "  docker compose logs -f jenkins"
echo ""
