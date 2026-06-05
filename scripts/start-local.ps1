# Start backend + frontend locally (no Docker)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

if (-not (Test-Path (Join-Path $Backend "venv\Scripts\python.exe"))) {
    Write-Host "Run setup first: .\scripts\setup-local.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 4

Write-Host "Seeding demo users (if backend is up)..."
try {
    & (Join-Path $Backend "venv\Scripts\python.exe") (Join-Path $Backend "add_test_users.py")
} catch {
    Write-Host "Could not seed users yet. Run manually after backend starts:" -ForegroundColor Yellow
    Write-Host "  cd backend; python add_test_users.py"
}

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Frontend'; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "App URLs:" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  API docs:  http://localhost:8000/docs"
Write-Host ""
Write-Host "Demo login:" -ForegroundColor Green
Write-Host "  student@demo.com / Demo123!"
Write-Host "  alumni@demo.com  / Demo123!"
Write-Host "  admin@demo.com   / Demo123!"
