# Dev-Server starten (nach setup-windows.ps1)
Set-Location $PSScriptRoot
if (-not (Test-Path ".pglite")) {
  Write-Host "Keine Datenbank gefunden. Bitte zuerst ..\setup-windows.ps1 ausfuehren."
  exit 1
}
npm run dev
