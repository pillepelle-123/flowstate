# Phase 3 Test-Anleitung

## Schritt 1: Test-Daten in Supabase einfügen

1. Öffne Supabase Dashboard: https://ymetnyhhokkxnezcebau.supabase.co
2. Gehe zu **SQL Editor**
3. Kopiere den Inhalt von `TEST_DATA_PHASE3.sql`
4. Führe das Script aus
5. Prüfe, ob die Daten angelegt wurden

## Schritt 2: App starten

```bash
cd flowstate
npm start
```

Dann drücke `w` für Web-Browser.

## Schritt 3: Moderator-Ansicht öffnen

Im Browser navigiere zu: **http://localhost:8081/moderator**

## Was du sehen solltest:

### ✅ Workshop-Header
- Titel: "Design Thinking Workshop"
- Status: 🟢 Läuft

### ✅ Ring-Timer
- Großer animierter Kreis
- Countdown läuft von 15:00 runter
- Farbe: Grün (wird bei 5min gelb, bei 1min rot)

### ✅ Session-Control-Panel
- Session: "Begrüßung & Intro"
- Typ: "input"
- Teilnehmer: 0
- Buttons: [+5 Min] [Pause] [Weiter]
- Buttons: [Material pushen] [Interaktion]

### ✅ Kommende Sessions
- Puffer 1 (10 Min) 🔵
- Brainstorming (30 Min)
- Puffer 2 (10 Min) 🔵

## Tests durchführen:

### Test 1: Timer läuft
- [ ] Timer zählt runter
- [ ] Zeit wird korrekt angezeigt (MM:SS)
- [ ] Animation ist smooth

### Test 2: +5 Min Button
1. Klicke auf **+5 Min**
2. Alert erscheint: "5 Min. von Buffer-Zeit abgezogen (2 Buffer-Sessions)"
3. Klicke **Bestätigen**
4. Timer sollte sich um 5 Minuten verlängern

### Test 3: Pause Button
1. Klicke auf **Pause**
2. Status ändert sich zu: 🟡 Pausiert
3. Timer stoppt

### Test 4: Weiter Button
1. Klicke auf **Weiter**
2. Confirmation-Dialog erscheint
3. Klicke **Weiter**
4. Session wechselt zu "Puffer 1"

### Test 5: Farbwechsel (optional)
Um den Farbwechsel zu testen, ändere in Supabase:

```sql
-- Timer auf 4 Minuten setzen (für Gelb)
UPDATE workshop_states
SET session_ends_at = NOW() + INTERVAL '4 minutes'
WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Timer auf 50 Sekunden setzen (für Rot)
UPDATE workshop_states
SET session_ends_at = NOW() + INTERVAL '50 seconds'
WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```

## Troubleshooting:

### "Workshop nicht gefunden"
→ Führe `TEST_DATA_PHASE3.sql` nochmal aus
→ Workshop-ID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`

### Timer läuft nicht
→ Prüfe in Supabase:
```sql
SELECT * FROM workshop_states WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```
Status muss `running` sein.

### Keine Realtime-Updates
→ Prüfe Browser-Console auf Fehler
→ Stelle sicher, dass Realtime in Supabase aktiviert ist

### Buttons reagieren nicht
→ Prüfe Browser-Console auf Fehler
→ Stelle sicher, dass `.env` korrekt ist

## Realtime-Test (2 Browser-Tabs):

1. Öffne `/moderator` in 2 Browser-Tabs
2. Klicke in Tab 1 auf **+5 Min**
3. Timer in Tab 2 sollte sich automatisch aktualisieren

## Erfolg! ✅

Wenn alle Tests funktionieren, ist Phase 3 erfolgreich implementiert!

## Nächste Schritte:

- Phase 4: Beamer-Dashboard
- Phase 5: Planungs-Editor
- Phase 6: Teilnehmer-App
