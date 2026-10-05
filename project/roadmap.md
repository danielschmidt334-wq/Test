# Roadmap

Stand: MVP Phase 1 (betriebsfähiges Tracking + Audit-Export) — Basis in `web/` umgesetzt.

## Kurzfristig (V1.1 — aktuelle Iteration)

- [x] `project/`-Struktur im Repo
- [x] Schulungskatalog: Anlegen **und Bearbeiten** (HR)
- [x] Dashboard: überfällige Pflichtschulungen hervorheben
- [x] Audit-Export: Vorschau-Zahlen vor Download
- [ ] PR #3 mergen nach Abnahme HR/QM

## Phase 2 (V2) — Skalierung & Entlastung

| Thema | Inhalt | IATF-Relevanz |
|-------|--------|----------------|
| Erinnerungen | E-Mail/In-App bei Frist, Eskalation FK | Nachweis aktiver Überwachung |
| Wiederkehrende Schulungen | Auto-Neu zuweisen nach Ablauf | Kompetenz 7.2 / Unterweisungen |
| Änderungsprotokoll | RR-04-light (Wer/Wann/Was am Katalog) | Audit Trail |
| SSO | Microsoft Entra ID | Unternehmens-IT |
| Matrix-Verknüpfung | Abschluss → Kompetenz-Level | QM-05 |
| Excel-Migration | Vollständiger Historien-Import | Cutover von Ist-Listen |

## Phase 3 (optional)

- Präsenztermine, Teams/Slack, BI, Mehrsprachigkeit

## Erfolgskriterium MVP (unverändert)

Trocken-Audit: Stichprobe 5 Personen × 3 Pflichtschulungen in **&lt; 15 Min** aus Export + Nachweisen belegbar.
