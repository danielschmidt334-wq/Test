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

## Fehler: `Could not locate the bindings file` (better-sqlite3)

SQLite nutzt ein **nativ kompiliertes** Modul. Unter Windows fehlt die `.node`-Datei, wenn die Installation nicht für dein System gebaut wurde.

### Schritt 1 — Neu installieren (PowerShell)

```powershell
cd C:\Users\Daniel\Desktop\Test-cursor-hr-qualimatrix-mvp-2b83\web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm rebuild better-sqlite3
npm run db:seed
npm run dev
```

### Schritt 2 — Node-Version prüfen

```powershell
node -v
```

Wenn **v24.x**: Node **22 LTS** installieren, Terminal neu öffnen, Schritt 1 wiederholen.

### Schritt 3 — Build-Tools (nur wenn `npm install` mit Compile-Fehler abbricht)

„Visual Studio Build Tools“ installieren mit Workload **„Desktopentwicklung mit C++“**, danach erneut `npm install` in `web/`.

## macOS

Gleiche Logik: kein kopiertes `node_modules`, `npm install` in `web/`. Bei Fehlern: Xcode Command Line Tools (`xcode-select --install`).
