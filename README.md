# HR Schulungs- und Qualimatrix-Tool (Knauf Industries MVP)

Web-Prototyp für Pflichtschulungen, Nachweise, Qualimatrix und IATF-Audit-Export.

## App starten

```bash
cd web
npm install
npm run db:setup   # Schema + Demo-Daten (einmalig oder nach DB_RESET)
npm run dev
```

Öffnen: http://localhost:3000

### Demo-Zugänge (Passwort überall: `demo1234`)

| Rolle | E-Mail |
|--------|--------|
| HR-Admin | `hr@demo.knauf.local` |
| QM (Lesen) | `qm@demo.knauf.local` |
| Führungskraft | `anna.schmidt@demo.knauf.local` |
| Mitarbeitende/r | `max1.muster@demo.knauf.local` |

## Funktionen (MVP)

- Schulungskatalog mit Pflichtflag und Intervall
- Zuweisungen inkl. Sammelzuweisung
- Meine Schulungen: Abschluss + Nachweis-Upload
- Qualimatrix-Lückenliste (Soll/Ist)
- Onboarding-Checklisten
- **Audit-Export** (CSV / ZIP mit Nachweisen)
- CSV-Import Mitarbeitende

## Technik

- Next.js 16 (App Router), TypeScript, Tailwind
- PGlite (Ordner `.pglite/`) via Prisma 7 — läuft ohne Postgres-Server; für Produktion echtes PostgreSQL

## Projektdokumentation

- **[`project/`](./project/README.md)** — Roadmap, Architektur, Entscheidungen (im Repo)
- **[Lokal starten / Windows-Fehler](./project/entwicklung-lokal.md)** — `better-sqlite3`, Node-Version
- Cursor Project Context (`docs/` im Agent Store) — Anforderungen, IATF-Kontext Knauf Industries
