# Roadmap

Stand: MVP Phase 1 (betriebsfähiges Tracking + Audit-Export) — Basis in `web/` umgesetzt.

## Kurzfristig (V1.1 — aktuelle Iteration)

- [x] `project/`-Struktur im Repo
- [x] Schulungskatalog: Anlegen **und Bearbeiten** (HR)
- [x] Dashboard: überfällige Pflichtschulungen hervorheben
- [x] Audit-Export: Vorschau-Zahlen vor Download
- [ ] PR #3 mergen nach Abnahme HR/QM

## Phase 2 (V2) — Skalierung & Entlastung

| Thema | Inhalt | Status |
|-------|--------|--------|
| Erinnerungen | In-App bei Frist, FK-Eskalation | **erledigt** (E-Mail offen) |
| Wiederkehrende Schulungen | HR-Wartung: Erneuerung nach `validUntil` | **erledigt** |
| Änderungsprotokoll | RR-04-light (`/protokoll`) | **erledigt** |
| HR-Berichte | `/berichte`, Abteilungsauswertung | **erledigt** |
| MA-Stammdaten | Bearbeiten / aktiv | **erledigt** |

Details: [v2-funktionen.md](./v2-funktionen.md)

| Thema | Inhalt | IATF-Relevanz |
|-------|--------|----------------|
| SSO | Microsoft Entra ID | Unternehmens-IT |
| Matrix-Verknüpfung | Abschluss → Kompetenz-Level | QM-05 |
| Excel-Migration | Vollständiger Historien-Import | Cutover von Ist-Listen |

## Phase 3 (optional)

- Präsenztermine, Teams/Slack, BI, Mehrsprachigkeit

## Erfolgskriterium MVP (unverändert)

Trocken-Audit: Stichprobe 5 Personen × 3 Pflichtschulungen in **&lt; 15 Min** aus Export + Nachweisen belegbar.
