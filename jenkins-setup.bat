@echo off
REM E-Commerce - Jenkins Setup Script for Windows
REM This script starts Jenkins with Docker Compose and displays the initial admin password

echo =========================================
echo   Jenkins Setup for Playwright Testing
echo =========================================
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Start Jenkins with Docker Compose
echo Starting Jenkins...
docker compose up -d

echo.
echo Waiting for Jenkins to start (this may take 30-60 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo =========================================
echo   Jenkins is starting!
echo =========================================
echo.
echo Jenkins URL: http://localhost:8080
echo.
echo Initial Admin Password:
echo =========================================

REM Get the initial admin password
docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword 2>nul
if %errorlevel% neq 0 (
    echo Password not yet available. Jenkins is still starting.
    echo Wait a few more seconds and run:
    echo docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword
)

echo =========================================
echo.
echo Next Steps:
echo 1. Open http://localhost:8080 in your browser
echo 2. Enter the initial admin password shown above
echo 3. Install suggested plugins
echo 4. Create your first admin user
echo 5. Follow the Jenkins setup guide in docs\JENKINS_SETUP.md
echo.
echo To stop Jenkins:
echo   docker compose down
echo.
echo To view logs:
echo   docker compose logs -f jenkins
echo.
pause
