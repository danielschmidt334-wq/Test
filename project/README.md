# HR Schulungs- und Qualimatrix-Tool — Projektordner

Dieser Ordner bündelt **Zweck, Planung und Architektur** für das Knauf-Industries-MVP (~80 Mitarbeitende, IATF 16949). Die lauffähige Anwendung liegt im Repository unter **`web/`**.

## Ordnerübersicht

| Datei / Ordner | Inhalt |
|----------------|--------|
| [README.md](./README.md) | Einstieg (diese Datei) |
| [roadmap.md](./roadmap.md) | Nächste Schritte (V2, IATF) |
| [architektur.md](./architektur.md) | Stack und Module |
| [entscheidungen/](./entscheidungen/) | Kurzentscheidungen (ADR-light) |
| [entwicklung-lokal.md](./entwicklung-lokal.md) | Start unter Windows/macOS, SQLite-Fehler beheben |

## Haupt-App-Linie

**Ziel-Codebasis:** [`web/`](../web/) (Next.js 16, Prisma, SQLite-Demo)

| Linie | Branch / PR | Status |
|-------|-------------|--------|
| **`web/`** (Haupt) | [PR #3](https://github.com/danielschmidt334-wq/Test/pull/3) `cursor/hr-qualimatrix-mvp-2b83` | Audit-Export, ~80-MA-Seed, Qualimatrix, Onboarding |
| Root-App (Duplikat) | [PR #2](https://github.com/danielschmidt334-wq/Test/pull/2) `cursor/mvp-hr-qualimatrix-078d` | **Deprecated** — gleiches MVP-Konzept ohne `web/`-Unterordner; nicht weiter pflegen |

`main` enthält noch keinen Anwendungscode; Merge erfolgt über die Draft-PRs.

## App starten

```bash
cd web
npm install
npm run db:seed   # bei leerer Datenbank
npm run dev
```

Details: [Root-README](../README.md).

## Kontext außerhalb des Repos

Ausführliche Anforderungen und IATF-Hintergrund liegen im Cursor-Project-Context (`docs/` im Agent Store).
