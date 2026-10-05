# Lokal starten (Windows)

## Schnellcheck: richtiger Stand?

`web/package.json` muss enthalten:

- `@electric-sql/pglite`
- `pglite-prisma-adapter`

**Darf nicht** vorkommen: `@prisma/adapter-better-sqlite3` oder `better-sqlite3`  
→ Sonst ist der Code **veraltet** (siehe unten „Neu holen“).

## Start (einfach)

Im **Repo-Root** (ein Ordner über `web`):

```powershell
.\setup-windows.ps1
cd web
.\start-dev.ps1
```

Oder Doppelklick: `setup-windows.cmd` im Repo-Root.

Nach Update: Ordner `web\.next` löschen und `.\setup-windows.ps1` erneut (Dev nutzt **Webpack**, nicht Turbopack — PGlite-Kompatibilität).

## Start (manuell)

```powershell
cd web
npm install
npm run db:setup
npm run dev
```

http://localhost:3000/login — `hr@demo.knauf.local` / `demo1234`

## Neu holen (bei better_sqlite3.node-Fehler)

Der Fehler bedeutet: alter SQLite-Stand. **Nicht** nur `npm install` — Code muss aktuell sein.

```powershell
cd C:\Users\Daniel\Desktop
git clone -b cursor/hr-qualimatrix-mvp-2b83 https://github.com/danielschmidt334-wq/Test.git Test-hr-tool-neu
cd Test-hr-tool-neu\web
Remove-Item -Recurse -Force node_modules,.pglite,.next -ErrorAction SilentlyContinue
npm install
npm run db:setup
npm run dev
```

Oder im bestehenden Ordner:

```powershell
cd C:\Users\Daniel\Desktop\Test-cursor-hr-qualimatrix-mvp-2b83
git fetch origin
git checkout cursor/hr-qualimatrix-mvp-2b83
git pull origin cursor/hr-qualimatrix-mvp-2b83
git log -1 --oneline
```

Letzter Commit sollte **„PGlite statt better-sqlite3“** (oder neuer) sein.

Dann `web`-Ordner wie oben leeren und `npm install` + `npm run db:setup`.
