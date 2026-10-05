# HR Schulungs-Tool — einmaliges Setup + Build (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Web = Join-Path $Root "web"

Write-Host "==> Ordner: $Web"
Set-Location $Web

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js fehlt. Bitte Node 20 oder 22 LTS von https://nodejs.org installieren."
}

Write-Host "==> Node: $(node -v)"

$pkg = Get-Content package.json -Raw
if ($pkg -match "adapter-better-sqlite3|better-sqlite3") {
  Write-Error @"
Veralteter Code (SQLite). Bitte Repo neu klonen:
  git clone -b cursor/hr-qualimatrix-mvp-2b83 https://github.com/danielschmidt334-wq/Test.git
"@
}

Write-Host "==> Alte Artefakte entfernen..."
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
if ($env:DB_RESET -eq "1") {
  Remove-Item -Recurse -Force .pglite -ErrorAction SilentlyContinue
}

Write-Host "==> npm install..."
npm install

Write-Host "==> Datenbank + Demo-Daten..."
npm run db:setup

Write-Host "==> Production Build..."
npm run build

Write-Host ""
Write-Host "Fertig. App starten mit:"
Write-Host "  cd web"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Browser: http://localhost:3000/login"
Write-Host "Login: hr@demo.knauf.local / demo1234"
