# One-time local setup (no Docker)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Mentor Bridge local setup ===" -ForegroundColor Cyan

# Backend venv + dependencies
$Backend = Join-Path $Root "backend"
Set-Location $Backend

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created backend/.env from .env.example"
}

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

Write-Host "Installing backend dependencies..."
& ".\venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\venv\Scripts\pip.exe" install -r requirements.txt

# Frontend dependencies
$Frontend = Join-Path $Root "frontend"
Set-Location $Frontend

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created frontend/.env from .env.example"
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
} else {
    Write-Host "Frontend node_modules already present"
}

Set-Location $Root
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Run:  .\scripts\start-local.ps1" -ForegroundColor Yellow
