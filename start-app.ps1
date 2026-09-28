# GRAVVY one-click start script
# Usage: right-click -> "Run with PowerShell", or: powershell -ExecutionPolicy Bypass -File start-app.ps1

$ErrorActionPreference = 'Stop'

# Make sure Node.js is on PATH for this session
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $env:PATH = "C:\Program Files\nodejs;$env:PATH"
}

Set-Location $PSScriptRoot

# Free up port 3000 if a stale process is holding it (e.g. after a crash)
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Write-Host "Port 3000 is busy - stopping the old process..." -ForegroundColor Yellow
    $listener | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

Write-Host "Starting GRAVVY on http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"

npm run dev
