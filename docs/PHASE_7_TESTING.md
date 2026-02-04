# Phase 7: Interaktions-Tools - Testfälle

## 🧪 Testfall 1: Ready-Button

### Vorbereitung:
```sql
-- Stelle sicher, dass Workshop und Session existieren
SELECT * FROM workshops WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
SELECT * FROM sessions WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```

### Test-Schritte:
1. **Öffne Teilnehmer-App**
   - Navigiere zu: http://localhost:8081/participant
   - Trete Workshop bei (ID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`)

2. **Klicke "Ich bin fertig"**
   - Button sollte sichtbar sein
   - Klicke auf Button

3. **Erwartetes Verhalten:**
   - ✅ Button wird grün
   - ✅ Text ändert sich zu "✓ Fertig!"
   - ✅ Button ist disabled
   - ✅ Modal schließt sich nach 1.5s

4. **Datenbank-Prüfung:**
```sql
SELECT * FROM interactions 
WHERE type = 'ready_signal' 
ORDER BY created_at DESC 
LIMIT 1;

-- Erwartetes Ergebnis:
-- type: 'ready_signal'
-- data: {"timestamp": "2024-..."}
-- participant_id: [deine ID]
-- session_id: [aktuelle Session]
```

5. **Moderator-Ansicht prüfen:**
   - Öffne: http://localhost:8081/moderator
   - ✅ Fortschrittsbalken zeigt 1/X Teilnehmer
   - ✅ Prozent-Anzeige aktualisiert

### Edge Cases:
- **Mehrfaches Klicken:** Button bleibt disabled
- **Ohne Session:** Button nicht sichtbar
- **Netzwerkfehler:** Loading-State, dann Fehler

---

## 🧪 Testfall 2: 2D-Matrix-Voting

### Test-Schritte:
1. **Öffne Matrix-Voting**
   - Klicke "📊 2D-Matrix Voting"
   - Modal öffnet sich

2. **Platziere Punkt**
   - Tippe auf Matrix-Feld (z.B. Mitte)
   - ✅ Blauer Punkt erscheint an Tap-Position
   - ✅ Button "Zurücksetzen" erscheint

3. **Koordinaten-Test:**
```javascript
// Teste verschiedene Positionen:
// Oben-Links: x=0, y=100
// Oben-Rechts: x=100, y=100
// Unten-Links: x=0, y=0
// Unten-Rechts: x=100, y=0
// Mitte: x=50, y=50
```

4. **Datenbank-Prüfung:**
```sql
SELECT * FROM interactions 
WHERE type = 'vote_2d' 
ORDER BY created_at DESC 
LIMIT 1;

-- Erwartetes Ergebnis:
-- type: 'vote_2d'
-- data: {"x": 50, "y": 50, "timestamp": "..."}
```

5. **Reset-Test:**
   - Klicke "Zurücksetzen"
   - ✅ Punkt verschwindet
   - ✅ Neuer Vote möglich

### Edge Cases:
- **Außerhalb Matrix:** Kein Punkt platziert
- **Mehrfaches Tippen:** Nur erster Vote zählt
- **Schnelles Tippen:** Debouncing funktioniert

---

## 🧪 Testfall 3: Digital Sticky Notes

### Test-Schritte:
1. **Öffne Sticky Note**
   - Klicke "📝 Sticky Note erstellen"
   - Modal öffnet sich

2. **Farbe wählen:**
   - Klicke auf jede Farbe
   - ✅ Vorschau-Hintergrund ändert sich
   - ✅ Border zeigt aktive Farbe

3. **Text eingeben:**
   - Schreibe: "Test-Idee für Workshop"
   - ✅ Zeichenzähler aktualisiert: "24/500"
   - ✅ Text erscheint in Vorschau

4. **Absenden:**
   - Klicke "📌 Sticky Note absenden"
   - ✅ Button zeigt "Sende..."
   - ✅ Modal schließt sich nach 1s
   - ✅ Textarea wird geleert

5. **Datenbank-Prüfung:**
```sql
SELECT * FROM interactions 
WHERE type = 'sticky_note' 
ORDER BY created_at DESC 
LIMIT 1;

-- Erwartetes Ergebnis:
-- type: 'sticky_note'
-- data: {
--   "text": "Test-Idee für Workshop",
--   "color": "#FEF08A",
--   "timestamp": "..."
-- }
```

### Edge Cases:
- **Leerer Text:** Button disabled
- **500+ Zeichen:** Input stoppt bei 500
- **Nur Leerzeichen:** Button disabled
- **Sonderzeichen:** Werden korrekt gespeichert

---

## 🧪 Testfall 4: Moderator Ready-Progress

### Vorbereitung:
```sql
-- Erstelle mehrere Teilnehmer
INSERT INTO participants (workshop_id, anonymous_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Teilnehmer-1'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Teilnehmer-2'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Teilnehmer-3');
```

### Test-Schritte:
1. **Öffne Moderator-Ansicht**
   - http://localhost:8081/moderator
   - ✅ Ready-Progress-Widget sichtbar
   - ✅ Zeigt "0/3 fertig"

2. **Teilnehmer 1 klickt Ready:**
   - In Teilnehmer-App: Klicke "Ich bin fertig"
   - Moderator-Ansicht:
     - ✅ Zähler: "1/3 fertig"
     - ✅ Fortschrittsbalken: 33%
     - ✅ Update < 1 Sekunde

3. **Teilnehmer 2 & 3 klicken Ready:**
   - Beide klicken "Ich bin fertig"
   - Moderator-Ansicht:
     - ✅ Zähler: "3/3 fertig"
     - ✅ Fortschrittsbalken: 100%
     - ✅ Grüne Farbe

### Realtime-Test:
```javascript
// Öffne 2 Browser-Tabs:
// Tab 1: Moderator
// Tab 2: Teilnehmer

// In Tab 2: Klicke Ready
// In Tab 1: Beobachte Update
// ✅ Update sollte < 1s sein
```

---

## 🧪 Testfall 5: Interaktions-Container

### Test-Schritte:
1. **Modal-Öffnen:**
   - Klicke jeden Interaktions-Button
   - ✅ Modal öffnet sich smooth
   - ✅ Richtiger Titel wird angezeigt
   - ✅ Richtige Komponente geladen

2. **Modal-Schließen:**
   - Klicke X-Button
   - ✅ Modal schließt sich
   - Klicke außerhalb (Android Back-Button)
   - ✅ Modal schließt sich

3. **Auto-Close:**
   - Ready-Button: Schließt nach 1.5s
   - Matrix-Voting: Schließt nach 2s
   - Sticky Note: Schließt nach 1s

---

## 🧪 Testfall 6: Multi-User-Szenario

### Setup:
- 3 Geräte/Browser-Tabs
- Alle als Teilnehmer eingeloggt
- 1 Moderator-Tab

### Test-Ablauf:
1. **Alle 3 Teilnehmer:**
   - Klicken "Ich bin fertig"
   - ✅ Jeder sieht eigenen Success-State

2. **Moderator:**
   - ✅ Sieht "3/3 fertig"
   - ✅ 100% Fortschritt

3. **Matrix-Voting:**
   - Teilnehmer 1: Klickt oben-links
   - Teilnehmer 2: Klickt unten-rechts
   - Teilnehmer 3: Klickt Mitte

4. **Datenbank-Prüfung:**
```sql
SELECT participant_id, data->>'x' as x, data->>'y' as y
FROM interactions 
WHERE type = 'vote_2d' 
AND session_id = '[current_session]';

-- Erwartetes Ergebnis: 3 Einträge mit verschiedenen Koordinaten
```

---

## 🧪 Testfall 7: Performance & Stress-Test

### Test 1: Schnelles Klicken
```javascript
// Klicke Ready-Button 10x schnell hintereinander
// ✅ Nur 1 Eintrag in DB
// ✅ Keine Duplikate
// ✅ UI bleibt responsive
```

### Test 2: Viele Teilnehmer
```sql
-- Erstelle 50 Ready-Signale
INSERT INTO interactions (session_id, participant_id, type, data)
SELECT 
  '[session_id]',
  gen_random_uuid(),
  'ready_signal',
  '{"timestamp": "2024-01-01T12:00:00Z"}'::jsonb
FROM generate_series(1, 50);

-- Moderator-Ansicht:
-- ✅ Zeigt "50/50"
-- ✅ Fortschrittsbalken korrekt
-- ✅ Keine Performance-Probleme
```

### Test 3: Lange Sticky Notes
```javascript
// Schreibe 500 Zeichen
const longText = 'A'.repeat(500)
// ✅ Wird akzeptiert
// ✅ Korrekt gespeichert

const tooLong = 'A'.repeat(501)
// ✅ Input stoppt bei 500
```

---

## 🧪 Testfall 8: Offline-Verhalten

### Test-Schritte:
1. **Mit Internet:**
   - Klicke "Ich bin fertig"
   - ✅ Funktioniert normal

2. **Ohne Internet:**
   - Schalte WLAN aus
   - Klicke "Ich bin fertig"
   - ✅ Zeigt Fehler oder Queue-Meldung
   - ✅ Keine App-Crash

3. **Reconnect:**
   - WLAN wieder an
   - ✅ Queued Interaktionen werden gesendet
   - ✅ Moderator erhält Updates

---

## 🧪 Testfall 9: Fehlerbehandlung

### Test 1: Ungültige Session-ID
```javascript
// Setze ungültige Session-ID
sessionId = 'invalid-id'
// Klicke Ready-Button
// ✅ Zeigt Fehlermeldung
// ✅ Keine DB-Einträge
```

### Test 2: Datenbank-Fehler
```sql
-- Simuliere DB-Fehler (temporär RLS deaktivieren)
-- Klicke Ready-Button
-- ✅ Zeigt Fehlermeldung
-- ✅ Button bleibt enabled für Retry
```

### Test 3: Netzwerk-Timeout
```javascript
// Simuliere langsames Netzwerk (Chrome DevTools)
// Klicke Ready-Button
// ✅ Zeigt Loading-State
// ✅ Timeout nach 10s
// ✅ Fehlermeldung
```

---

## ✅ Checkliste: Alle Tests

### Ready-Button:
- [ ] Button sichtbar bei aktiver Session
- [ ] Sendet Signal an DB
- [ ] Visuelles Feedback
- [ ] Disabled nach Klick
- [ ] Auto-Close Modal
- [ ] Moderator sieht Update

### Matrix-Voting:
- [ ] Touch-Interaktion funktioniert
- [ ] Punkt wird platziert
- [ ] Koordinaten korrekt (0-100)
- [ ] Reset funktioniert
- [ ] Nur 1 Vote pro Teilnehmer
- [ ] DB-Eintrag korrekt

### Sticky Notes:
- [ ] Farb-Auswahl funktioniert
- [ ] Text-Eingabe funktioniert
- [ ] Zeichenzähler korrekt
- [ ] Submit speichert in DB
- [ ] Auto-Clear nach Submit
- [ ] 500 Zeichen-Limit

### Moderator-Ansicht:
- [ ] Ready-Progress sichtbar
- [ ] Echtzeit-Updates < 1s
- [ ] Fortschrittsbalken korrekt
- [ ] Prozent-Anzeige korrekt
- [ ] Funktioniert mit vielen Teilnehmern

### Performance:
- [ ] Keine Duplikate bei schnellem Klicken
- [ ] 50+ Teilnehmer kein Problem
- [ ] UI bleibt responsive
- [ ] Realtime < 1s Latenz

### Fehlerbehandlung:
- [ ] Offline-Modus funktioniert
- [ ] Fehler werden angezeigt
- [ ] Keine App-Crashes
- [ ] Retry möglich

---

## 🎯 Akzeptanzkriterien

### Must-Have:
- ✅ Alle 4 Interaktions-Typen funktionieren
- ✅ Daten werden in DB gespeichert
- ✅ Moderator sieht Echtzeit-Updates
- ✅ Keine Duplikate
- ✅ Fehlerbehandlung vorhanden

### Nice-to-Have:
- ✅ Smooth Animationen
- ✅ Offline-Queue
- ✅ Performance-Optimierung
- ✅ Accessibility

---

## 🐛 Bekannte Issues

1. **Matrix-Voting auf Web:**
   - Touch-Events können abweichen
   - Lösung: Teste auf echtem Gerät

2. **Realtime-Latenz:**
   - Bei schlechtem Netzwerk > 2s
   - Akzeptabel: < 2s bei gutem Netzwerk

3. **Sticky Notes Farben:**
   - Können auf verschiedenen Displays anders aussehen
   - Akzeptabel: Farben sind unterscheidbar

---

## 📊 Test-Report Template

```markdown
## Test-Durchlauf: [Datum]

### Umgebung:
- Browser: Chrome 120
- Gerät: iPhone 14 / Android Pixel 7
- Netzwerk: WiFi / 4G

### Ergebnisse:
- Ready-Button: ✅ Pass
- Matrix-Voting: ✅ Pass
- Sticky Notes: ✅ Pass
- Moderator-Progress: ✅ Pass
- Performance: ✅ Pass
- Fehlerbehandlung: ⚠️ Minor Issues

### Issues:
1. [Beschreibung]
2. [Beschreibung]

### Fazit:
✅ Bereit für Production / ⚠️ Fixes nötig / ❌ Nicht bereit
```
