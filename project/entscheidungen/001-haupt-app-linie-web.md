# ADR 001: Haupt-App unter `web/`

**Status:** angenommen  
**Datum:** 2025-10-05

## Kontext

Zwei parallele MVP-Branches: Root-Next-App (PR #2) und identisches Feature-Set unter `web/` (PR #3) mit Audit-Export und ausgebautem Seed.

## Entscheidung

- **Weiterentwicklung nur in `web/`.**
- PR #2 gilt als **deprecated**; kein Merge in `main` ohne Konsolidierung.
- Projektdokumentation lebt in `project/` (deutsch).

## Konsequenzen

- Root-README verweist auf `project/` und `web/`.
- Neue Features, Build und CI beziehen sich auf `cd web && npm run build`.
