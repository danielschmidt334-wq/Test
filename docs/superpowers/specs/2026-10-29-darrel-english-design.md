# DaRrel English Studio – Design

**Datum:** 2026-10-29  
**Ziel:** Eine lokale Web-App, mit der der Lernende Englischunterricht mit Lehrer DaRrel strukturiert nachbereitet, Hausaufgaben trackt und gezielt übt.

## Anforderungen (aus Nutzerwunsch abgeleitet)

- Zusammenarbeit und Üben mit DaRrel unterstützen
- Kein Backend zwingend nötig (schneller Start, Datenschutz)
- Deutschsprachige Oberfläche, englische Lerninhalte

## Architektur

- Statische Single-Page-App: `index.html`, `assets/styles.css`, `assets/app.js`
- Persistenz: `localStorage` (Schlüssel `darrel-english-studio-v1`)
- Optional: JSON Export/Import zum Teilen mit DaRrel

## Module (UI-Tabs)

1. **Übersicht** – Termin, offene HW, Streak, Tagesimpuls
2. **Vokabeln** – Karteikarten + Liste
3. **Hausaufgaben** – Fälligkeit, Erledigt, „von DaRrel“
4. **Üben** – Writing/Speaking-Prompts, Grammatik-Fokus, Schreibentwurf
5. **Lektionen** – Protokoll inkl. Feedback von DaRrel
6. **Einstellungen** – Profil, Backup

## Nicht im Scope (YAGNI)

- Login, Cloud-Sync, KI-Korrektur (kann später ergänzt werden)
- Native Mobile Apps

## Erfolgskriterien

- App läuft über lokalen Static Server
- Daten überleben Browser-Neustart
- Export erzeugt gültiges JSON
