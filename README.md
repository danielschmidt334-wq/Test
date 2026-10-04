# HR Schulungs- und Qualimatrix-Tool (Knauf Industries MVP)

Web-Prototyp für Pflichtschulungen, Nachweise, Qualimatrix und IATF-Audit-Export.

## App starten

```bash
cd web
npm install
npm run db:seed    # Demo-Daten (nur bei leerer DB nötig)
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
- SQLite (`dev.db`) via Prisma 7 — für Produktion PostgreSQL empfohlen

Projektdokumentation liegt im Cursor Project Context (`docs/`).
