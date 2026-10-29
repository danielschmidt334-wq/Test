# DaRrel English Studio

Persönliche Web-App zum **Organisieren und Üben** mit deinem Englischlehrer **DaRrel**. Alle Daten bleiben lokal im Browser (localStorage).

## Funktionen

| Bereich | Beschreibung |
|--------|--------------|
| **Übersicht** | Nächste Stunde, offene Hausaufgaben, Vokabelanzahl, Tages-Streak |
| **Vokabeln** | Karteikarten, Liste, neue Wörter aus den Lektionen |
| **Hausaufgaben** | Aufgaben mit Fälligkeitsdatum, Markierung „von DaRrel“ |
| **Üben** | Schreib- und Sprechimpulse, Grammatik-Fokus, Schreibentwurf |
| **Lektionen** | Protokolle mit Themen, Feedback von DaRrel, eigenen Notizen |
| **Einstellungen** | Name, nächster Termin, JSON-Export/Import für Backup oder Teilen |

## Starten

Die App ist statisch – kein npm nötig.

```bash
cd /workspace
python3 -m http.server 8080
```

Dann im Browser öffnen: [http://localhost:8080](http://localhost:8080)

Alternativ kann `index.html` über GitHub Pages oder einen beliebigen Static Host deployed werden.

## Hinweise

- Beim ersten Start sind Beispieldaten (Vokabeln, eine Hausaufgabe, eine Lektion) vorgegeben – du kannst sie löschen oder anpassen.
- Unter **Einstellungen → Export** kannst du deinen Fortschritt als JSON sichern oder an DaRrel schicken.
