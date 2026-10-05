# Lokale Entwicklung (Windows / macOS)

## App starten

```bash
cd web
npm install
npm run db:seed    # erstes Mal
npm run dev
```

Browser: http://localhost:3000/login — Demo: `hr@demo.knauf.local` / `demo1234`

## Wichtig

- **`node_modules` nie kopieren** (z. B. von Cloud-Agent oder Mac) — immer `npm install` **auf dem gleichen PC** im Ordner `web/` ausführen.
- Empfohlen: **Node.js 22 LTS** ([nodejs.org](https://nodejs.org/)). Node 24 kann bei nativen Modulen noch ohne fertige Binaries sein.

## Datenbank (PGlite)

Die App nutzt **PGlite** (PostgreSQL im Prozess, **ohne** `better-sqlite3` / native Windows-Builds). Daten liegen im Ordner `web/.pglite`.

```bash
cd web
npm install
npm run db:setup    # Schema + Demo-Daten (einmalig oder nach DB_RESET)
npm run dev
```

**Nach `git pull` (wichtig bei DB-Umstellung):**

```powershell
cd C:\Users\Daniel\Desktop\Test-cursor-hr-qualimatrix-mvp-2b83\web
Remove-Item -Recurse -Force node_modules,.pglite,.next -ErrorAction SilentlyContinue
npm install
npm run db:setup
npm run dev
```

Schema neu aufsetzen: `set DB_RESET=1` (cmd) oder `$env:DB_RESET=1` (PowerShell), dann `npm run db:push` und `npm run db:seed`.

## Alt: Fehler `Could not locate the bindings file` (better-sqlite3)

Tritt nur bei **älteren Stand** mit SQLite auf. Lösung: neuesten Branch pullen (PGlite) und Schritte oben ausführen.

## macOS

Gleiche Logik: kein kopiertes `node_modules`, `npm install` in `web/`. Bei Fehlern: Xcode Command Line Tools (`xcode-select --install`).
