# ADR 002: E-Mail-Outbox und Entra ID (geplant)

**Status:** teilweise umgesetzt (Outbox) / geplant (Entra)  
**Datum:** 2025-10-05

## E-Mail

- **Jetzt:** `EmailOutbox` + Dateien unter `web/storage/emails/` bei HR-Wartung (kein SMTP nötig für Demo).
- **Später:** `SMTP_HOST` / Microsoft Graph — Versand-Connector, sobald IT Credentials bereitstellt.

## Entra ID (Microsoft SSO)

- **Noch nicht** im Code — Demo bleibt E-Mail/Passwort.
- **Ziel:** `@azure/msal-node` oder Auth.js Provider `MicrosoftEntraID`, Rollen-Mapping HR/QM/FK/MA aus AD-Gruppen.
