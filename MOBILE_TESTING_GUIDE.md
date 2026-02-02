# Mobile App Testing Guide

## Voraussetzungen

1. **Node.js und npm** installiert
2. **Expo Go App** auf deinem Smartphone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Option 1: Auf echtem Gerät testen (Empfohlen)

### Schritt 1: Server starten
```bash
cd flowstate
npm start
```

### Schritt 2: QR-Code scannen
- **iOS**: Öffne die Kamera-App und scanne den QR-Code im Terminal
- **Android**: Öffne Expo Go App und scanne den QR-Code

### Schritt 3: App testen
1. Wähle "Teilnehmer" auf der Startseite
2. Teste die verschiedenen Modi:
   - **QR-Scanner**: Funktioniert nur auf echtem Gerät
   - **Manuelle Eingabe**: Gib Workshop-ID ein

### Test-Workshop-ID
```
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

## Option 2: iOS Simulator (nur macOS)

### Schritt 1: iOS Simulator installieren
```bash
# Xcode aus App Store installieren
# Dann Command Line Tools:
xcode-select --install
```

### Schritt 2: App im Simulator starten
```bash
cd flowstate
npm run ios
```

### Hinweis
- QR-Scanner funktioniert nicht im Simulator
- Nutze "Manuelle Eingabe" zum Testen

## Option 3: Android Emulator

### Schritt 1: Android Studio installieren
1. Lade [Android Studio](https://developer.android.com/studio) herunter
2. Installiere Android SDK und erstelle einen Virtual Device (AVD)

### Schritt 2: Emulator starten
```bash
# Starte Android Studio und öffne AVD Manager
# Starte einen Emulator
```

### Schritt 3: App im Emulator starten
```bash
cd flowstate
npm run android
```

### Hinweis
- QR-Scanner funktioniert nicht im Emulator
- Nutze "Manuelle Eingabe" zum Testen

## Option 4: Web-Version (Eingeschränkt)

### Schritt 1: Web-Server starten
```bash
cd flowstate
npm run web
```

### Schritt 2: Browser öffnen
- Öffnet automatisch: http://localhost:8081
- Oder manuell öffnen

### Hinweis
- QR-Scanner nicht verfügbar
- Nur manuelle Eingabe möglich
- Einige native Features funktionieren nicht

## Test-Szenarien

### 1. Teilnehmer-Flow testen

#### A) Mit manueller Eingabe:
1. Öffne App → "Teilnehmer"
2. Klicke "Manuelle Eingabe"
3. Gib Workshop-ID ein: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
4. Optional: Gib deinen Namen ein
5. Klicke "Jetzt beitreten"
6. Dashboard sollte erscheinen

#### B) Mit QR-Code (nur echtes Gerät):
1. Öffne Moderator-Ansicht auf einem anderen Gerät/Browser
2. Klicke "📱 QR-Code anzeigen"
3. Scanne QR-Code mit Teilnehmer-App
4. Gib Namen ein und trete bei

### 2. Dashboard-Features testen

Nach dem Beitreten:
- ✅ Workshop-Titel wird angezeigt
- ✅ Teilnehmer-Name/ID wird angezeigt
- ✅ Aktuelle Session wird angezeigt
- ✅ Timer läuft synchron (wenn Workshop läuft)
- ✅ "Hilfe anfordern" Button funktioniert

### 3. Realtime-Synchronisation testen

1. Öffne Moderator-Ansicht in Browser: http://localhost:8081/moderator
2. Starte eine Session
3. Teilnehmer-App sollte automatisch aktualisieren:
   - Neue Session wird angezeigt
   - Timer startet
   - Aufgabenbeschreibung erscheint

### 4. Deep-Linking testen (nur native)

#### iOS Simulator:
```bash
xcrun simctl openurl booted flowstate://join/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

#### Android Emulator:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "flowstate://join/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
```

## Troubleshooting

### Problem: "Network request failed"
**Lösung**: 
- Stelle sicher, dass `.env` Datei existiert
- Prüfe Supabase-Credentials
- Beide Geräte müssen im gleichen WLAN sein

### Problem: QR-Scanner zeigt schwarzen Bildschirm
**Lösung**:
- Kamera-Berechtigung erteilen
- App neu starten
- Nur auf echtem Gerät verfügbar

### Problem: "Workshop nicht gefunden"
**Lösung**:
- Prüfe, ob Workshop in Datenbank existiert
- Verwende Test-Workshop-ID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
- Führe SQL-Script aus: `TEST_DATA_PHASE3.sql`

### Problem: Timer läuft nicht
**Lösung**:
- Starte Session in Moderator-Ansicht
- Prüfe Supabase Realtime-Verbindung
- Schaue in Browser-Console nach Fehlern

### Problem: Expo Go zeigt Fehler
**Lösung**:
```bash
# Cache löschen und neu starten
cd flowstate
npm start -- --clear
```

## Performance-Tipps

### Für beste Performance:
1. **Echtes Gerät verwenden** (nicht Emulator)
2. **Gleiche WLAN-Verbindung** für alle Geräte
3. **Expo Go App aktuell halten**
4. **Development-Modus**: Langsamer, aber mit Hot-Reload

### Production-Build (schneller):
```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## Nützliche Befehle

```bash
# Server starten
npm start

# Cache löschen
npm start -- --clear

# Nur iOS
npm run ios

# Nur Android
npm run android

# Nur Web
npm run web

# Logs anzeigen
npx expo start --dev-client
```

## Nächste Schritte

Nach erfolgreichem Test:
1. ✅ Teilnehmer können beitreten
2. ✅ Dashboard zeigt Workshop-Info
3. ✅ Timer synchronisiert
4. ✅ Realtime-Updates funktionieren

Bereit für **Phase 7**: Interaktions-Tools
- Ready-Button
- 2D-Matrix-Voting
- Digital Sticky Notes
- Silent Help Request
