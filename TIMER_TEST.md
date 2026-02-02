# Timer Engine Test-Anleitung

## Voraussetzungen:
1. ✅ Supabase-Projekt erstellt
2. ✅ `.env` mit Credentials ausgefüllt
3. ✅ SQL-Migrations ausgeführt
4. ✅ Supabase Realtime aktiviert (standardmäßig aktiv)

## Test durchführen:

### 1. App starten
```bash
cd flowstate
npm run web
```

### 2. Zur Test-Seite navigieren
- Öffne http://localhost:8081 (oder der angezeigte Port)
- Klicke auf "Timer Engine testen"

### 3. Test-Workshop erstellen
- Klicke auf "1. Test-Workshop erstellen"
- Du siehst Workshop-ID und Session-ID
- Der Timer wird angezeigt (00:00)

### 4. Timer starten
- Klicke auf "▶ Start (20min)"
- Timer läuft jetzt 20 Minuten
- Farbe: Grün (>5min verbleibend)

### 5. Echtzeit-Synchronisation testen
**Wichtig:** Öffne einen zweiten Browser-Tab mit der gleichen URL
- Beide Timer sollten synchron laufen
- Klicke in Tab 1 auf "Pause" → Tab 2 pausiert auch
- Klicke in Tab 2 auf "Start" → Tab 1startet auch
- Klicke auf "+5 Min" → Beide Timer verlängern sich

### 6. Farbwechsel testen
Um schnell zu testen, ändere in `timer-test.tsx`:
```typescript
await TimerControlService.startSession(workshopId, sessionId, 1) // 1 Minute statt 20
```
- Bei <25% (15 Sek): Gelb
- Bei <5% (3 Sek): Rot

## Was getestet wird:

✅ **Workshop/Session Erstellung**
- CRUD-Operationen funktionieren
- Datenbank-Verbindung OK

✅ **Timer-Logik**
- Countdown läuft korrekt
- 100ms Update-Intervall
- Formatierung (MM:SS)

✅ **Realtime-Synchronisation**
- WebSocket-Verbindung
- Live-Updates über Tabs
- Status-Synchronisation

✅ **Timer-Control**
- Start/Pause funktioniert
- Extend (+5min) funktioniert
- State-Updates in DB

✅ **UI-Updates**
- Farbwechsel (Grün → Gelb → Rot)
- Status-Anzeige
- Responsive Updates

## Troubleshooting:

### "Cannot find module" Fehler
```bash
cd flowstate
npm install
```

### Timer startet nicht
- Prüfe `.env` Credentials
- Prüfe Supabase Dashboard → SQL Editor → Tabellen existieren?
- Prüfe Browser Console für Fehler

### Keine Realtime-Updates
- Supabase Dashboard → Settings → API → Realtime aktiviert?
- Browser Console: WebSocket-Verbindung OK?

### RLS Policy Fehler
- Du musst eingeloggt sein (später in Phase 6)
- Temporär: RLS für Tests deaktivieren:
```sql
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_states DISABLE ROW LEVEL SECURITY;
```

## Nächste Schritte:
Nach erfolgreichem Test → Phase 3: Moderator Live-Ansicht mit Ring-Progress-Timer
