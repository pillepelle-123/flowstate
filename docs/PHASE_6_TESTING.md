# Phase 6 Features Testing Guide

## 🚀 Schnellstart

### 1. Server starten
```bash
cd flowstate
npm start
```

### 2. App auf Gerät öffnen
- **Smartphone**: Expo Go App → QR-Code scannen
- **Web**: http://localhost:8081

---

## 📱 Feature-Tests auf mobilen Endgeräten

### Test 1: QR-Code Scanning (nur echtes Gerät)

#### Vorbereitung:
1. Öffne auf PC/Laptop: http://localhost:8081/moderator
2. Klicke "📱 QR-Code anzeigen"
3. QR-Code wird angezeigt

#### Test auf Smartphone:
1. Öffne Expo Go App
2. Scanne QR-Code vom Terminal (um App zu laden)
3. In der App: Wähle "Teilnehmer"
4. QR-Scanner öffnet sich automatisch
5. Scanne den Workshop-QR-Code vom PC-Bildschirm
6. ✅ Sollte zur Join-Screen weiterleiten

**Erwartetes Ergebnis:**
- Kamera öffnet sich
- QR-Code wird erkannt
- Automatische Weiterleitung zur Name-Eingabe

---

### Test 2: Anonymous Authentication

#### Auf beliebigem Gerät:
1. Öffne App → "Teilnehmer"
2. Klicke "Manuelle Eingabe"
3. Gib Workshop-ID ein: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
4. Optional: Gib Namen ein (z.B. "Max Mustermann")
5. Klicke "Jetzt beitreten"

**Erwartetes Ergebnis:**
- Loading-Spinner erscheint
- Dashboard wird geladen
- Teilnehmer-Name/ID wird angezeigt
- Keine Fehlermeldung

**Troubleshooting:**
- Fehler 422: Anonymous Sign-in in Supabase aktivieren
  - Dashboard → Authentication → Providers → Anonymous Sign-ins → Enable

---

### Test 3: Push-Notifications (nur echtes Gerät)

#### Vorbereitung:
```bash
# Notifications-Test-Script erstellen
```

#### Test:
1. Öffne App auf Smartphone
2. Trete Workshop bei
3. Erlaube Notifications wenn gefragt
4. Warte auf Session-Start vom Moderator

**Erwartetes Ergebnis:**
- Permission-Dialog erscheint
- Nach Erlaubnis: Token wird registriert
- Bei Session-Start: Notification erscheint

**Manueller Test:**
```javascript
// In ParticipantDashboard.tsx temporär hinzufügen:
import { NotificationService } from '../../services/notifications'

// Test-Button:
<TouchableOpacity onPress={() => 
  NotificationService.sendLocalNotification(
    'Test', 
    'Notification funktioniert!'
  )}>
  <Text>Test Notification</Text>
</TouchableOpacity>
```

---

### Test 4: Offline-Support

#### Test-Szenario:
1. Öffne App mit Internet
2. Trete Workshop bei
3. Warte bis Dashboard geladen ist
4. **Schalte WLAN/Mobile Daten AUS**
5. Schließe App
6. Öffne App erneut (noch offline)

**Erwartetes Ergebnis:**
- Dashboard zeigt gecachte Daten
- Workshop-Titel sichtbar
- Letzte Session-Info sichtbar
- Keine Crash/Fehler

**Prüfen:**
```bash
# Native: Daten in FileSystem
# Web: localStorage im Browser-DevTools
```

---

### Test 5: Deep-Linking

#### iOS (Simulator):
```bash
xcrun simctl openurl booted flowstate://join/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

#### Android (Emulator):
```bash
adb shell am start -W -a android.intent.action.VIEW -d "flowstate://join/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
```

#### Echtes Gerät:
1. Sende dir selbst eine SMS/E-Mail mit:
   ```
   flowstate://join/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
   ```
2. Klicke auf den Link

**Erwartetes Ergebnis:**
- App öffnet sich automatisch
- Join-Screen erscheint mit Workshop-ID
- Direkt beitreten möglich

---

### Test 6: OTA-Updates (Expo Updates)

#### Hinweis:
OTA-Updates funktionieren nur in Production-Builds, nicht in Development.

#### Für Production-Test:
```bash
# 1. EAS Build erstellen
npx eas build --platform android --profile preview

# 2. Update veröffentlichen
npx eas update --branch preview --message "Test Update"

# 3. App öffnen → Update wird automatisch geladen
```

**In Development:**
- Auto-Update ist deaktiviert
- Siehe Console-Log: "Updates disabled in development mode"

---

### Test 7: Realtime-Synchronisation

#### Setup (2 Geräte benötigt):
- **Gerät 1**: Moderator-Ansicht (PC oder Tablet)
- **Gerät 2**: Teilnehmer-App (Smartphone)

#### Test:
1. **Gerät 2**: Trete Workshop bei
2. **Gerät 1**: Starte eine Session
3. **Gerät 2**: Beobachte Dashboard

**Erwartetes Ergebnis:**
- Session-Titel aktualisiert sich automatisch
- Timer startet synchron
- Aufgabenbeschreibung erscheint
- Keine manuelle Aktualisierung nötig

**Timing-Test:**
- Beide Geräte sollten max. 1 Sekunde Unterschied haben
- Timer läuft flüssig ohne Ruckeln

---

### Test 8: Material-Links

#### Vorbereitung:
1. Füge in Supabase eine Session mit Material hinzu:
```sql
UPDATE sessions 
SET materials = '["https://example.com/material.pdf"]'::jsonb
WHERE id = 'SESSION_ID';
```

#### Test:
1. Trete Workshop bei
2. Warte bis Session mit Material startet
3. Klicke "Material 1 öffnen"

**Erwartetes Ergebnis:**
- Button ist sichtbar
- Klick öffnet Browser/PDF-Viewer
- Link wird korrekt geöffnet

---

### Test 9: Hilfe-Button

#### Test:
1. Trete Workshop bei
2. Klicke "🆘 Hilfe anfordern"

**Erwartetes Ergebnis:**
- Alert erscheint: "Hilfe angefordert"
- Eintrag in `interactions` Tabelle
- Moderator sieht Benachrichtigung (Phase 7)

**Prüfen in Supabase:**
```sql
SELECT * FROM interactions 
WHERE type = 'help_request' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🌐 Web-spezifische Tests

### Test 10: PWA-Installation (nur Web)

#### Chrome/Edge:
1. Öffne http://localhost:8081/participant
2. Klicke auf "Installieren" in der Adressleiste
3. App wird als PWA installiert

**Erwartetes Ergebnis:**
- Install-Prompt erscheint
- App öffnet sich in eigenem Fenster
- Icon auf Desktop/Homescreen

#### Offline-Test (PWA):
1. Installiere PWA
2. Öffne DevTools → Application → Service Workers
3. Aktiviere "Offline"
4. Lade Seite neu

**Erwartetes Ergebnis:**
- Seite lädt aus Cache
- Grundfunktionen verfügbar

---

## 🔧 Debugging-Tools

### React Native Debugger
```bash
# Chrome DevTools öffnen
# In Expo Go: Shake → "Debug Remote JS"
```

### Expo DevTools
```bash
npm start
# Drücke 'm' für mehr Optionen
```

### Logs anzeigen
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android

# Alle
npm start -- --dev-client
```

---

## 📊 Performance-Tests

### Timer-Synchronisation
1. Öffne App auf 2+ Geräten
2. Trete gleichen Workshop bei
3. Vergleiche Timer-Anzeige

**Akzeptabel:** < 1 Sekunde Unterschied

### Realtime-Latenz
1. Moderator startet Session
2. Messe Zeit bis Teilnehmer-Update

**Akzeptabel:** < 2 Sekunden

### Offline-Cache-Geschwindigkeit
1. Lade Dashboard mit Internet
2. Schalte offline
3. Öffne App neu

**Akzeptabel:** < 1 Sekunde Ladezeit

---

## ✅ Checkliste: Alle Features

### Basis-Features
- [ ] QR-Code scannen (native)
- [ ] Manuelle Workshop-ID-Eingabe
- [ ] Anonymous Sign-in
- [ ] Name-Eingabe (optional)
- [ ] Dashboard-Anzeige

### Native Features
- [ ] Push-Notifications-Permission
- [ ] Notification empfangen
- [ ] Offline-Modus funktioniert
- [ ] Deep-Link öffnet App
- [ ] Auto-Update (Production)

### Realtime-Features
- [ ] Session-Wechsel live
- [ ] Timer synchronisiert
- [ ] Material-Links funktionieren
- [ ] Hilfe-Button sendet Signal

### Web-Features
- [ ] PWA installierbar
- [ ] Service Worker aktiv
- [ ] Offline-Modus (Web)
- [ ] localStorage-Cache

---

## 🐛 Häufige Probleme

### "Network request failed"
**Lösung:**
- Prüfe `.env` Datei
- Beide Geräte im gleichen WLAN
- Supabase-URL korrekt

### QR-Scanner schwarzer Bildschirm
**Lösung:**
- Kamera-Permission erteilen
- Nur auf echtem Gerät
- App neu starten

### Notifications funktionieren nicht
**Lösung:**
- Permission erteilt?
- Nur auf echtem Gerät
- iOS: Physical Device nötig
- Android: Emulator unterstützt Notifications

### Offline-Cache leer
**Lösung:**
- Einmal mit Internet laden
- Cache-Initialisierung abwarten
- Prüfe FileSystem-Permissions

### Deep-Link öffnet nicht
**Lösung:**
- App muss installiert sein
- Custom Scheme registriert?
- iOS: Universal Links konfiguriert?

---

## 📱 Empfohlene Test-Geräte

### Minimum:
- 1x Smartphone (iOS oder Android)
- 1x PC/Laptop (für Moderator)

### Optimal:
- 2x Smartphones (verschiedene OS)
- 1x Tablet
- 1x PC/Laptop
- Verschiedene Netzwerke testen

---

## 🎯 Nächste Schritte

Nach erfolgreichem Test:
1. ✅ Alle Features funktionieren
2. ✅ Realtime-Sync läuft stabil
3. ✅ Offline-Modus getestet
4. ✅ Notifications funktionieren

**Bereit für Phase 7:** Interaktions-Tools
