# V2-Funktionen (erste Ausbaustufe)

## Neu in der App

| Bereich | Funktion |
|---------|----------|
| **Mitteilungen** | In-App-Erinnerungen (Frist / überfällig), FK-Eskalation |
| **Berichte** | HR-Wartung (Erneuerung abgelaufener Pflichtschulungen + Erinnerungen), Überfällig nach Abteilung |
| **Protokoll** | RR-04-light Audit-Log (Katalog, MA-Stammdaten, Abschlüsse) |
| **Mitarbeitende** | Stammdaten bearbeiten, aktiv/inaktiv |

## Datenbank-Update

Nach `git pull`:

```bash
cd web
npm run db:push    # wendet prisma/patches/*.sql an
```

Bei Problemen: `DB_RESET=1 npm run db:setup` (löscht lokale Demo-DB).

## Nächste Schritte (V2.1+)

- E-Mail-Versand (SMTP/Graph)
- Entra ID SSO
- Schulungsabschluss → Kompetenzmatrix automatisch
- Terminplanung Präsenzschulungen
