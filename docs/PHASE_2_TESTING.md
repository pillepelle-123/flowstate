# Phase 2 Feature Tests

## Voraussetzungen

1. **SQL-Funktion deployen:**
   - Öffne Supabase Dashboard → SQL Editor
   - Führe aus: `supabase/migrations/20240101000003_server_time_function.sql`

2. **Edge Function deployen (optional):**
   - Supabase Dashboard → Edge Functions → Create new function
   - Name: `timer-control`
   - Code aus: `supabase/functions/timer-control/index.ts`

## Test-Seite öffnen

Navigiere zu: **http://localhost:8081/phase2-test**

## Tests durchführen

### 1. Server-Zeit-Synchronisation

**Test 1: RPC-Funktion**
- Klicke "Test RPC get_server_time()"
- Erwartung: Alert mit Server-Zeit

**Test 2: TimeSync Service**
- Klicke "Sync Server Time"
- Erwartung: 
  - Server Time angezeigt
  - Offset in Millisekunden
  - Last Sync Zeit

**Erfolg:** Offset sollte < 100ms sein

### 2. Broadcast-Service

**Setup:**
1. Öffne `/phase2-test` in 2 Browser-Tabs
2. Positioniere Tabs nebeneinander

**Test:**
1. In Tab 1: Klicke "Start" Button
2. In Tab 2: Prüfe Broadcast Log
3. Erwartung: Log-Eintrag erscheint in beiden Tabs

**Weitere Tests:**
- Klicke "Pause" → Log sollte aktualisieren
- Klicke "Resume" → Log sollte aktualisieren

**Erfolg:** Alle Commands erscheinen in beiden Tabs

### 3. Edge Function: Timer-Controller

**Voraussetzung:** Edge Function muss deployed sein

**Test 1: Start Session**
1. Klicke "Start" Button
2. Erwartung: 
   - Alert "Edge Function Success!"
   - JSON-Response mit `success: true`

**Test 2: Pause Timer**
1. Klicke "Pause" Button
2. Erwartung: Success-Response

**Test 3: Extend Timer**
1. Klicke "Extend" Button
2. Erwartung: Success-Response

**Erfolg:** Alle Actions geben Success zurück

### 4. Integration Test

**Vollständiger Workflow:**

1. Öffne `/phase2-test` in Tab 1
2. Öffne `/moderator` in Tab 2
3. In Tab 1: Klicke "Start" (Edge Function)
4. In Tab 2: Timer sollte starten
5. In Tab 1: Klicke "Pause" (Broadcast)
6. In Tab 2: Timer sollte pausieren

**Erfolg:** Timer synchronisiert über beide Tabs

## Fehlerbehandlung

### "RPC Error: function get_server_time() does not exist"
→ SQL-Funktion noch nicht deployed
→ Führe Migration aus

### "Edge Function Error: FunctionsRelayError"
→ Edge Function nicht deployed oder falsche URL
→ Prüfe Supabase Dashboard → Edge Functions

### "Broadcast Error"
→ Realtime nicht aktiviert
→ Supabase Dashboard → Database → Replication → Enable

### Keine Broadcast-Logs
→ Öffne Browser Console
→ Prüfe auf Fehler
→ Stelle sicher, dass beide Tabs dieselbe Workshop-ID nutzen

## Erwartete Ergebnisse

✅ **Server-Zeit-Synchronisation:**
- Offset < 100ms
- Sync funktioniert ohne Fehler

✅ **Broadcast-Service:**
- Commands erscheinen in allen Tabs
- < 200ms Latenz

✅ **Edge Function:**
- Alle Actions erfolgreich
- workshop_states wird aktualisiert

## Debugging

**Browser Console öffnen:**
- Chrome/Edge: F12
- Prüfe auf Fehler oder Warnungen

**Supabase Logs:**
- Dashboard → Logs → Edge Functions
- Prüfe auf Fehler

**Netzwerk-Tab:**
- Prüfe Requests zu Supabase
- Status sollte 200 sein
