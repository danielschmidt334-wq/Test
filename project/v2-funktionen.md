# V2 / V2.1 — HR-Funktionen

## V2 (Basis)

| Bereich | Funktion |
|---------|----------|
| **Mitteilungen** | In-App-Erinnerungen, FK-Eskalation |
| **Berichte** | Wartung, Abteilungsauswertung |
| **Protokoll** | RR-04-light Audit-Log |
| **Mitarbeitende** | Bearbeiten, aktiv/inaktiv |

## V2.1 (neu)

| Bereich | Funktion |
|---------|----------|
| **Qualimatrix** | Automatischer Kompetenz-Boost nach Schulungsabschluss (Soll-Cap der Rolle) |
| **E-Mail-Outbox** | Beim Wartungslauf werden Mails in `storage/emails/` geschrieben (SMTP vorbereitet) |
| **Historie-Import** | CSV unter **Zuweisungen** (Excel-Migration Abschlüsse) |
| **Termine** | Präsenztermine planen (HR), Anmeldung (MA/FK) |

## Datenbank-Update

```bash
cd web
npm run db:push
```

Patches: `prisma/patches/v2-*.sql`, `v3-v21-*.sql`

## Nächste Schritte (V2.2)

- Entra ID SSO — siehe [002-email-und-entra.md](./entscheidungen/002-email-und-entra.md)
- Echter SMTP/Graph-Versand
- Kompetenz-Zuordnung im Schulungskatalog (Dropdown)
- Kalender-Export (iCal) für Termine
