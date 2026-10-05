# Architektur (MVP)

## Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | Next.js 16 App Router, React, TypeScript, Tailwind CSS |
| API | Next.js Route Handlers + Server Actions |
| Daten | **PGlite** (`.pglite/`, Postgres-kompatibel, ohne DB-Server) — Produktion: PostgreSQL empfohlen |
| Auth | JWT in Cookie, Demo-Passwort-Hash (bcrypt) |
| Dateien | Lokaler Upload-Ordner für Schulungsnachweise |

## Module (Routen)

| Bereich | Pfad | Rollen |
|---------|------|--------|
| Übersicht | `/dashboard` | alle |
| Mitarbeitende + CSV-Import | `/mitarbeitende` | HR |
| Schulungskatalog | `/schulungen` | HR, QM (Lesen) |
| Zuweisungen | `/zuweisungen` | HR |
| Meine Schulungen | `/meine-schulungen` | MA, FK |
| Team | `/team` | FK |
| Qualimatrix | `/matrix` | FK, HR, QM |
| Onboarding | `/onboarding` | HR |
| Audit-Export | `/audit`, `/api/audit/export` | HR, QM |

## Domänenmodell (Kern)

- **Employee** — Stammdaten, Abteilung, FK-Beziehung
- **Training** — Katalog (Pflicht, Intervall, Kategorie/Tags)
- **TrainingAssignment** — Zuweisung, Frist, Status, Nachweis, Gültig-bis
- **Competency / JobRole** — Soll-Ist-Matrix
- **Onboarding** — Vorlagen und Instanzen

## Sicherheit (MVP)

- Rollenprüfung in Server Actions und API-Routen
- FK-Sicht nur auf eigenes Team (`getEmployeeScope`)
- QM: Lesen + Audit-Export, keine Stammdatenänderung
