# HR Schulungs- und Qualimatrix-Tool (MVP)

Demo-tauglicher Prototyp für **Knauf Industries** (~80 MA): Pflichtschulungen, Nachweise, Qualimatrix-Lücken, HR-Export — **nicht** production-hardened.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn-ähnliche UI-Komponenten
- Prisma ORM + **SQLite** (lokale Demo; PostgreSQL optional via Docker)
- Session-Auth per E-Mail/Passwort (JWT-Cookie)

## Voraussetzungen

- Node.js 20+
- npm

## Einrichtung

```bash
cp .env.example .env
npm install
npm run db:setup    # prisma db push + Seed (~10 Demo-User)
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Demo-Zugänge (Passwort für alle: `demo1234`)

| Rolle | E-Mail |
|--------|--------|
| HR-Admin | `hr.admin@knauf-demo.local` |
| Führungskraft | `fuehrungskraft@knauf-demo.local` |
| Mitarbeitende | `anna.schmidt@knauf-demo.local` (weitere im Seed) |

## PostgreSQL (optional)

```bash
docker compose up -d
```

In `.env` die `DATABASE_URL` aus `.env.example` (PostgreSQL-Zeile) aktivieren, `provider` in `prisma/schema.prisma` auf `postgresql` stellen, dann `npm run db:setup`.

## MVP-Funktionen

- **RBAC:** HR-Admin, Führungskraft, Mitarbeitende
- **Stammdaten:** Abteilungen, FK-Zuordnung, Job-Profile (Seed)
- **Schulungskatalog** mit Pflicht, Intervall, Kategorie
- **Zuweisungen** inkl. Sammelzuweisung (HR)
- **Meine Schulungen:** Abschluss + Nachweis-Upload (Dateisystem unter `uploads/`)
- **Onboarding:** Vorlage + Zuweisung + Checkliste
- **Qualimatrix:** Soll/Ist und Lückenliste
- **HR-Dashboard** (überfällig, Quoten) + **CSV-Export**
- **FK Team-Ansicht**

## Skripte

| Befehl | Beschreibung |
|--------|----------------|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm run db:push` | Schema in DB anwenden |
| `npm run db:seed` | Demo-Daten laden |

## Hinweise

- `AUTH_SECRET` in `.env` für produktionsnahe Umgebungen ändern.
- Entra ID / SSO bewusst **nicht** im MVP — siehe Projekt-Doku.
- Nachweise werden lokal gespeichert (`UPLOAD_DIR`); S3/Blob-Anbindung für V2.
