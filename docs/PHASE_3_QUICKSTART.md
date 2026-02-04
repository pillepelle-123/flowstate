# Phase 3 Quick Start Guide

## 🚀 Schnellstart

### 1. Dependencies installiert?
```bash
cd flowstate
npm install
```

Neue Dependencies in Phase 3:
- `moti` - Deklarative Animationen
- `expo-haptics` - Haptisches Feedback

### 2. Test-Daten in Supabase anlegen

```sql
-- Workshop erstellen
INSERT INTO workshops (id, title, description, date, total_duration, buffer_strategy)
VALUES (
  'test-workshop-123',
  'Design Thinking Workshop',
  'Ein interaktiver Workshop',
  NOW() + INTERVAL '1 day',
  180,
  'distributed'
);

-- Sessions erstellen
INSERT INTO sessions (workshop_id, title, type, planned_duration, order_index, is_buffer, description)
VALUES 
  ('test-workshop-123', 'Begrüßung & Intro', 'input', 15, 0, false, 'Vorstellung und Agenda'),
  ('test-workshop-123', 'Puffer 1', 'break', 10, 1, true, 'Zeitpuffer'),
  ('test-workshop-123', 'Brainstorming', 'interaction', 30, 2, false, 'Ideen sammeln'),
  ('test-workshop-123', 'Puffer 2', 'break', 10, 3, true, 'Zeitpuffer'),
  ('test-workshop-123', 'Prototyping', 'group', 45, 4, false, 'Prototypen bauen'),
  ('test-workshop-123', 'Präsentation', 'input', 30, 5, false, 'Ergebnisse vorstellen');

-- Workshop State initialisieren
INSERT INTO workshop_states (workshop_id, status)
VALUES ('test-workshop-123', 'planned');
```

### 3. App starten

```bash
npm start
```

Dann:
- Drücke `w` für Web
- Drücke `i` für iOS Simulator
- Drücke `a` für Android Emulator

### 4. Moderator-Ansicht öffnen

Navigiere zu: `/moderator`

Oder passe `app/moderator.tsx` an:
```typescript
const workshopId = 'test-workshop-123' // Deine Workshop-ID
```

### 5. Timer starten

In der Supabase Console oder via Code:
```typescript
import { WorkshopService } from './src/services/workshop'

// Erste Session starten
await WorkshopService.startSession(
  'test-workshop-123',
  'erste-session-id'
)
```

## 🎯 Features testen

### Ring-Timer
- ✅ Läuft der Timer?
- ✅ Ändert sich die Farbe bei 5min (gelb) und 1min (rot)?
- ✅ Vibriert das Gerät bei Schwellenwerten?
- ✅ Pulsiert die Anzeige bei < 1min?

### Control-Panel
- ✅ **+5 Min Button**: Zeigt Alert mit Buffer-Auswirkung?
- ✅ **Pause Button**: Stoppt den Timer?
- ✅ **Weiter Button**: Wechselt zur nächsten Session?
- ✅ Haptic Feedback bei allen Buttons?

### Smart Buffer
- ✅ Bei +5min: Wird Buffer reduziert?
- ✅ Wenn kein Buffer: Wird Workshop-Ende verschoben?
- ✅ Zeigt die Notification die richtige Auswirkung?

### Session-Übersicht
- ✅ Werden die nächsten 3 Sessions angezeigt?
- ✅ Sind Buffer-Sessions mit 🔵 markiert?
- ✅ Stimmen die Dauern?

## 🔧 Troubleshooting

### Timer läuft nicht
1. Prüfe `workshop_states` Tabelle:
   ```sql
   SELECT * FROM workshop_states WHERE workshop_id = 'test-workshop-123';
   ```
2. Status muss `running` sein
3. `session_started_at` und `session_ends_at` müssen gesetzt sein

### Keine Realtime-Updates
1. Prüfe Supabase Realtime in der Console
2. Stelle sicher, dass Realtime für `workshop_states` aktiviert ist
3. Checke Browser-Console auf WebSocket-Fehler

### Haptics funktionieren nicht
- Haptics funktionieren nur auf echten Geräten, nicht im Simulator
- Auf iOS: Stelle sicher, dass Vibration in Einstellungen aktiviert ist
- Auf Android: Prüfe Vibrations-Berechtigung

### Komponenten werden nicht gefunden
```bash
# TypeScript Cache löschen
rm -rf node_modules/.cache
npm start -- --clear
```

## 📱 Responsive Testing

Teste auf verschiedenen Bildschirmgrößen:
- iPhone SE (klein)
- iPhone 14 Pro (mittel)
- iPad (groß)
- Web Desktop

Der Timer sollte sich automatisch anpassen.

## 🎨 Styling anpassen

Alle Komponenten nutzen NativeWind (Tailwind CSS):

```typescript
// Farben ändern
<View className="bg-blue-500"> // Hintergrund
<Text className="text-red-600"> // Text

// Größen ändern
<RingProgressTimer size={320} strokeWidth={24} />

// Abstände anpassen
<View className="p-8 gap-4">
```

## 🔄 Nächste Schritte

Nach erfolgreichem Test von Phase 3:

1. **Phase 4**: Beamer-Dashboard für Teilnehmer-Anzeige
2. **Phase 5**: Planungs-Editor mit Drag-and-Drop
3. **Phase 6**: Teilnehmer-App mit QR-Code-Join

## 📚 Weitere Ressourcen

- [Moti Docs](https://moti.fyi/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [NativeWind](https://www.nativewind.dev/)

## 💡 Tipps

1. **Performance**: Reanimated läuft auf dem UI-Thread → 60fps garantiert
2. **Debugging**: Nutze `console.log` in `useTimer` Hook für Timer-Updates
3. **Realtime**: Öffne mehrere Browser-Tabs um Sync zu testen
4. **Buffer-Logik**: Teste mit verschiedenen Buffer-Strategien

## ✅ Phase 3 Checklist

- [x] Ring-Progress-Timer implementiert
- [x] Session-Control-Panel erstellt
- [x] Smart-Buffer-Logik funktioniert
- [x] Moderator-Live-Ansicht vollständig
- [x] Haptic Feedback integriert
- [x] Realtime-Synchronisation aktiv
- [x] Dokumentation erstellt
- [x] Demo-Route verfügbar

**Status: Phase 3 abgeschlossen! 🎉**
