# FlowState – Projekt-Phasenplan

## Übersicht
Dieses Dokument definiert die Entwicklungsphasen für FlowState, das Workshop-Betriebssystem als Cross-Platform-App (iOS, Android, Web). Jede Phase baut auf der vorherigen auf und liefert ein funktionsfähiges Inkrement.

---

## Phase 1: Fundament & Datenmodell
**Ziel:** Projekt-Setup, Datenbank-Schema und grundlegende Architektur

### Aufgaben:
1. **Projekt-Initialisierung**
   - Expo + React Native Setup mit TypeScript und Web-Support
   - NativeWind (Tailwind für React Native) Integration
   - Supabase-Projekt erstellen und SDK mit Expo SecureStore einbinden
   - Expo Router für plattformübergreifende Navigation
   - Ordnerstruktur: `/src/components`, `/src/services`, `/src/hooks`, `/src/types`, `/src/stores`, `/src/utils/platform.ts`
   - Platform-spezifische Komponenten: `/src/components/native`, `/src/components/web`
   - Hinweis: du befindest dich bereits im Root-Ordner (Ordner-Name: workshop_react)

2. **Datenmodell (PostgreSQL Schema)**
   ```sql
   -- Workshops (Hauptentität)
   workshops:
     - id (uuid, PK)
     - title (text)
     - description (text)
     - date (timestamp)
     - total_duration (integer, Minuten)
     - buffer_strategy (enum: 'fixed', 'distributed', 'end')
     - created_by (uuid, FK -> auth.users)
     - created_at, updated_at

   -- Sessions (Workshop-Blöcke)
   sessions:
     - id (uuid, PK)
     - workshop_id (uuid, FK)
     - title (text)
     - type (enum: 'input', 'interaction', 'individual', 'group', 'break', 'orga')
     - planned_duration (integer, Minuten)
     - actual_duration (integer, nullable)
     - order_index (integer)
     - description (text)
     - materials (jsonb, Array von URLs/Datei-IDs)
     - method_template_id (uuid, nullable, FK)
     - is_buffer (boolean, default false)

   -- Live Workshop State (Echtzeit-Synchronisation)
   workshop_states:
     - id (uuid, PK)
     - workshop_id (uuid, FK, unique)
     - current_session_id (uuid, FK, nullable)
     - status (enum: 'planned', 'running', 'paused', 'completed')
     - started_at (timestamp, nullable)
     - paused_at (timestamp, nullable)
     - server_time_offset (integer, Millisekunden)
     - session_started_at (timestamp, nullable)
     - session_ends_at (timestamp, nullable)

   -- Teilnehmer (Anonymous Sessions)
   participants:
     - id (uuid, PK)
     - workshop_id (uuid, FK)
     - anonymous_id (text, generiert)
     - display_name (text, optional)
     - joined_at (timestamp)
     - last_seen (timestamp)

   -- Interaktionen (Votings, Sticky Notes, etc.)
   interactions:
     - id (uuid, PK)
     - session_id (uuid, FK)
     - participant_id (uuid, FK)
     - type (enum: 'vote_2d', 'sticky_note', 'ready_signal', 'help_request')
     - data (jsonb)
     - created_at (timestamp)

   -- Methoden-Bibliothek
   method_templates:
     - id (uuid, PK)
     - name (text)
     - category (text)
     - default_duration (integer)
     - description (text)
     - materials (jsonb)
     - instructions (text)
   ```

3. **Row Level Security (RLS) Policies**
   - Moderatoren: Voller Zugriff auf eigene Workshops
   - Teilnehmer: Lesezugriff auf workshop_states, Schreibzugriff nur auf eigene interactions
   - Display-Modus: Lesezugriff auf workshop_states und sessions

4. **TypeScript Types generieren**
   - Supabase CLI nutzen: `supabase gen types typescript`
   - Types in `/src/types/database.ts` speichern

**Prompt für Phase 1:**
```
Initialisiere ein Expo-Projekt mit Web-Support und TypeScript. Konfiguriere NativeWind 
und Expo Router. Erstelle das Supabase-Datenbankschema für FlowState basierend auf dem 
definierten Modell. Implementiere die RLS-Policies für Moderatoren, Teilnehmer und 
Display-Modus. Generiere die TypeScript-Types und erstelle eine Service-Klasse 
'WorkshopService' mit CRUD-Operationen für Workshops und Sessions. Konfiguriere 
Supabase SDK mit Expo SecureStore.
```

---

## Phase 2: Echtzeit-Timer-Engine
**Ziel:** Synchronisierter Timer mit WebSocket-Anbindung

### Aufgaben:
1. **Timer-Service (Zustand Store)**
   ```typescript
   // /src/stores/timerStore.ts
   interface TimerState {
     workshopId: string | null
     currentSessionId: string | null
     status: 'idle' | 'running' | 'paused'
     sessionStartedAt: number | null  // Unix timestamp
     sessionEndsAt: number | null
     serverTimeOffset: number  // Differenz zwischen Server und Client
     remainingMs: number
   }
   ```

2. **Supabase Realtime Integration**
   - Subscribe auf `workshop_states` Tabelle
   - Broadcast-Channel für Timer-Commands (start, pause, extend)
   - Server-Zeit-Synchronisation via Edge Function

3. **Timer-Logik**
   - Berechnung der verbleibenden Zeit basierend auf `sessionEndsAt - (Date.now() + serverTimeOffset)`
   - Auto-Update alle 100ms via React Native Reanimated
   - Haptisches Feedback bei 5min/1min (Expo Haptics)
   - Background-Timer via Expo Background Fetch

4. **Edge Function: Timer-Controller**
   ```typescript
   // supabase/functions/timer-control/index.ts
   // POST /timer-control
   // Body: { action: 'start' | 'pause' | 'extend', workshopId, sessionId, extensionMinutes? }
   // Aktualisiert workshop_states und broadcasted Change-Event
   ```

**Prompt für Phase 2:**
```
Implementiere einen synchronisierten Timer-Service mit Zustand Store. 
Erstelle die Supabase Realtime-Anbindung für die workshop_states Tabelle. 
Baue eine Edge Function 'timer-control', die Timer-Aktionen (start, pause, extend) 
verarbeitet und den State aktualisiert. Nutze React Native Reanimated für 
performante Animationen und Expo Haptics für haptisches Feedback. Implementiere 
Expo Background Fetch für Timer-Updates im Hintergrund. Stelle sicher, dass die 
Timer-Anzeige auf mehreren Clients exakt synchron läuft (max. 100ms Abweichung).
```

---

## Phase 3: Moderator Live-Ansicht (Mobile-First)
**Ziel:** Haupt-Interface für Workshop-Steuerung

### Aufgaben:
1. **Ring-Progress-Timer Komponente**
   - SVG-basierter Kreis mit react-native-svg
   - Animationen via React Native Reanimated + Moti
   - Farbwechsel: Grün → Gelb (5min) → Rot (1min)
   - Zentrale Zeitanzeige (MM:SS)
   - Vibration bei Schwellenwerten (Expo Haptics)

2. **Session-Control Panel**
   ```
   [Session-Titel]
   [Ring-Timer]
   [+5 Min] [Pause] [Nächste Session]
   [Aktuelle Teilnehmer: 12/15]
   [Material pushen] [Interaktion starten]
   ```

3. **Smart Buffer Logik**
   - Bei +5min: Prüfe verfügbare Buffer-Sessions
   - Reduziere Buffer oder verschiebe Workshop-Ende
   - Zeige Auswirkung in Toast-Notification

4. **Remote Control für Beamer**
   - Toggle: "Beamer zeigt Timer" / "Beamer zeigt Interaktion"
   - Push-Button für Material-Links an Teilnehmer

**Prompt für Phase 3:**
```
Erstelle die Moderator-Live-Ansicht als mobile-first React Native Komponente. 
Implementiere den Ring-Progress-Timer mit react-native-svg, React Native Reanimated 
und Moti für Animationen. Baue das Session-Control-Panel mit Buttons für +5min, 
Pause und Session-Wechsel. Integriere die Smart-Buffer-Logik: Bei Zeitverlängerung 
sollen automatisch Buffer-Sessions reduziert oder das Workshop-Ende angepasst werden. 
Zeige die Auswirkung als Notification an. Nutze React Native Gesture Handler für 
Touch-Interaktionen.
```

---

## Phase 4: Beamer-Dashboard (Public Display)
**Ziel:** Großflächige Anzeige für Teilnehmer

### Aufgaben:
1. **Fokus-Mode Layout**
   ```
   +----------------------------------+
   |  [Workshop-Titel]                |
   |                                  |
   |     [Riesiger Ring-Timer]        |
   |     [Session: "Brainstorming"]   |
   |                                  |
   |  Nächster Schritt:               |
   |  → Ideen auf Sticky Notes        |
   +----------------------------------+
   ```

2. **Break-Screen**
   - Countdown mit Animation (z.B. Kaffeetasse füllt sich)
   - Optional: Spotify-Embed oder YouTube-Link

3. **Interaktions-Visualisierungen**
   - Live-Voting-Balkendiagramm
   - 2D-Matrix mit Punkten (Scatter-Plot)
   - Sticky-Note-Wall (Masonry-Layout)

4. **Display-Modus Authentifizierung**
   - Spezielle "Display-Token" für Beamer-Geräte
   - Read-only Zugriff via RLS

**Prompt für Phase 4:**
```
Erstelle die Beamer-Dashboard-Ansicht (primär Web, optional Expo tvOS/Android TV) 
mit großflächigem Timer und Session-Info. Implementiere einen animierten Break-Screen 
mit Countdown. Baue Visualisierungs-Komponenten für Live-Votings (Balkendiagramm) und 
2D-Matrix-Voting (Scatter-Plot mit Victory Native oder Recharts). Erstelle einen 
Display-Modus mit eigenem Auth-Token für Read-only-Zugriff.
```

---

## Phase 5: Planungs-Editor
**Ziel:** Workshop-Erstellung und Session-Management

### Aufgaben:
1. **Workshop-Formular**
   - Titel, Beschreibung, Datum, Gesamtdauer
   - Buffer-Strategie auswählen

2. **Drag-and-Drop Session-Editor**
   - Library: `react-native-draggable-flatlist` oder `react-native-reanimated-dnd`
   - Session-Karten mit Typ-Icon, Titel, Dauer
   - Inline-Editing für Metadaten
   - Web-Fallback mit @dnd-kit

3. **Methoden-Bibliothek Integration**
   - Seitenleiste mit vorgefertigten Templates
   - Drag-Template → Erstellt neue Session mit Defaults

4. **Zeitplan-Visualisierung**
   - Timeline mit Balken (Gantt-ähnlich)
   - Automatische Berechnung von Start-/Endzeiten
   - Warnung bei Überschreitung der Gesamtdauer

**Prompt für Phase 5:**
```
Erstelle einen Workshop-Planungs-Editor mit Drag-and-Drop für Sessions. 
Nutze react-native-draggable-flatlist für native Plattformen und @dnd-kit als 
Web-Fallback. Implementiere Inline-Editing für Session-Details (Titel, Dauer, Typ, 
Beschreibung). Baue eine Methoden-Bibliothek-Seitenleiste, aus der Templates per 
Drag-and-Drop hinzugefügt werden können. Zeige eine Timeline-Visualisierung mit 
automatischer Zeitberechnung.
```

---

## Phase 6: Teilnehmer Native App (QR-Code Join)
**Ziel:** Low-Friction Teilnahme via native App (iOS/Android) und Web

### Aufgaben:
1. **QR-Code Generierung & Scanning**
   - Generierung: `react-native-qrcode-svg` (native) oder `qrcode.react` (web)
   - Scanning: Expo Camera mit Barcode-Scanner
   - URL-Format: `https://flowstate.app/join/{workshop-id}`

2. **Anonymous Auth Flow**
   - Supabase Anonymous Sign-in
   - Generierung von `anonymous_id` (z.B. "Teilnehmer-42")
   - Optional: Name eingeben

3. **Teilnehmer-Dashboard**
   ```
   [Workshop: "Design Thinking"]
   [Aktuelle Phase: Brainstorming]
   [Timer: 08:32]
   
   [Deine Aufgabe:]
   Sammle 5 Ideen für...
   
   [Material öffnen] [Hilfe anfordern]
   ```

4. **Native App Features**
   - Expo Notifications für Push-Benachrichtigungen
   - Expo Updates für OTA-Updates
   - Offline-Support via Expo FileSystem
   - Deep-Linking für QR-Code-Join

**Prompt für Phase 6:**
```
Erstelle die Teilnehmer-App mit QR-Code-basiertem Join-Flow. Nutze Expo Camera 
für QR-Code-Scanning auf nativen Plattformen. Implementiere Supabase Anonymous 
Authentication und generiere eindeutige Teilnehmer-IDs. Baue das Teilnehmer-Dashboard 
mit Timer-Anzeige, Aufgabenbeschreibung und Material-Links. Integriere Expo 
Notifications für Material-Push. Implementiere Deep-Linking und Expo Updates für 
OTA-Deployments. Erstelle Web-Fallback mit PWA-Manifest.
```

---

## Phase 7: Interaktions-Tools
**Ziel:** Digitale Moderationswerkzeuge

### Aufgaben:
1. **Ready-Button**
   - Großer Button: "Ich bin fertig"
   - Sendet `ready_signal` an interactions-Tabelle
   - Moderator sieht Fortschrittsbalken (X/Y fertig)

2. **2D-Matrix-Voting**
   - Touch-Interface: Tippen platziert Punkt
   - Achsen-Labels konfigurierbar (z.B. "Aufwand" / "Nutzen")
   - Live-Sync auf Beamer

3. **Digital Sticky Notes**
   - Textarea + Farbe wählen
   - Submit → Erscheint auf Beamer-Wall
   - Moderator kann clustern (Drag-and-Drop)

4. **Silent Help Request**
   - Button sendet Notification an Moderator
   - Zeigt Teilnehmer-ID und Tischnummer (optional)

**Prompt für Phase 7:**
```
Implementiere die Interaktions-Tools für Teilnehmer mit React Native Komponenten. 
Erstelle einen Ready-Button, der Signale an die Datenbank sendet und dem Moderator 
einen Fortschrittsbalken zeigt. Baue ein 2D-Matrix-Voting-Interface mit React Native 
Gesture Handler für Touch-Interaktion und Live-Synchronisation. Implementiere Digital 
Sticky Notes mit Farb-Auswahl und Echtzeit-Anzeige auf dem Beamer. Füge einen 
Silent-Help-Request-Button hinzu, der den Moderator via Expo Notifications benachrichtigt.
```

---

## Phase 8: Material-Push & Storage
**Ziel:** Automatische Bereitstellung von Workshop-Materialien

### Aufgaben:
1. **Supabase Storage Setup**
   - Bucket: `workshop-materials`
   - RLS: Moderatoren können uploaden, Teilnehmer nur lesen

2. **Material-Upload im Planungs-Editor**
   - Expo DocumentPicker für native Dateiauswahl
   - Expo ImagePicker für Bilder
   - Drag-and-Drop für Web
   - Verknüpfung mit Session via `materials` JSONB-Feld

3. **Auto-Push an Teilnehmer**
   - Bei Session-Start: Prüfe `materials`-Array
   - Sende Push-Notification via Expo Notifications
   - Öffne Link/PDF automatisch oder zeige Button
   - Nutze Expo Sharing für Datei-Sharing

4. **Material-Bibliothek**
   - Übersicht aller hochgeladenen Dateien
   - Wiederverwendung in mehreren Workshops

**Prompt für Phase 8:**
```
Richte Supabase Storage für Workshop-Materialien ein und implementiere RLS-Policies. 
Erstelle einen File-Upload im Planungs-Editor mit Expo DocumentPicker und ImagePicker 
für native Plattformen, Drag-and-Drop für Web. Baue die Auto-Push-Logik: Bei 
Session-Start sollen verknüpfte Materialien automatisch via Expo Notifications an 
Teilnehmer-Geräte gesendet werden. Nutze Expo Sharing für Datei-Sharing. Implementiere 
eine Material-Bibliothek zur Wiederverwendung von Dateien.
```

---

## Phase 9: Analyse & Reporting
**Ziel:** Post-Workshop Auswertung

### Aufgaben:
1. **Timing-Log**
   - Automatisches Tracking: Soll- vs. Ist-Zeiten pro Session
   - Visualisierung als Balkendiagramm

2. **Sentiment-Heatmap**
   - Teilnehmer können nach jeder Session Emoji-Feedback geben
   - Aggregation und Anzeige als Heatmap (Zeit × Stimmung)

3. **Interaktions-Export**
   - Sammle alle Sticky Notes, Votings, etc.
   - Generiere PDF-Report via expo-print (native) oder react-pdf (web)
   - Nutze Expo Sharing zum Teilen des Reports

4. **E-Mail-Report (Edge Function)**
   - Automatischer Versand nach Workshop-Ende
   - Enthält: Timing-Log, Teilnehmer-Anzahl, Interaktions-Zusammenfassung

**Prompt für Phase 9:**
```
Implementiere das Analyse-Modul mit Timing-Log (Soll/Ist-Vergleich) und 
Visualisierung als Balkendiagramm (Victory Native für native, Recharts für Web). 
Erstelle ein Emoji-Feedback-System für Teilnehmer und aggregiere die Daten zu einer 
Sentiment-Heatmap. Baue einen PDF-Export für alle Interaktionsdaten mit expo-print 
(native) und react-pdf (web). Nutze Expo Sharing zum Teilen. Erstelle eine Edge 
Function, die nach Workshop-Ende automatisch einen E-Mail-Report an den Moderator sendet.
```

---

## Phase 10: Polish & Optimierung
**Ziel:** UX-Verbesserungen und Performance

### Aufgaben:
1. **Offline-Resilience**
   - Expo FileSystem für lokales Caching
   - NetInfo für Netzwerk-Status-Überwachung
   - Auto-Reconnect bei WLAN-Abbruch
   - Queue für Interaktionen während Offline-Phase
   - Service Worker für Web-Plattform

2. **Responsive Design**
   - Tablet-Optimierung für Moderator-Ansicht
   - Desktop-Layout für Planungs-Editor

3. **Accessibility**
   - Keyboard-Navigation für alle Interaktionen
   - Screen-Reader-Labels (ARIA)
   - Kontrast-Check (WCAG AA)

4. **Performance-Optimierung**
   - Code-Splitting für Routen
   - Lazy-Loading für Interaktions-Komponenten
   - Optimierung der Realtime-Subscriptions (nur aktive Workshops)

5. **Error Handling & Logging**
   - Toast-Notifications für Fehler
   - Sentry React Native für Error-Tracking
   - Expo Application Services (EAS) für CI/CD

**Prompt für Phase 10:**
```
Optimiere die App für Offline-Nutzung: Implementiere Expo FileSystem für lokales 
Caching und NetInfo für Netzwerk-Status-Überwachung. Erstelle eine Queue für 
Interaktionen während Offline-Phasen. Verbessere das Responsive Design für Tablet 
und Desktop. Führe einen Accessibility-Audit durch und implementiere Keyboard-Navigation 
sowie ARIA-Labels. Optimiere die Performance durch Code-Splitting und Lazy-Loading. 
Integriere Sentry React Native für Error-Tracking. Konfiguriere Expo Application 
Services (EAS) für automatisierte Builds und Deployments (iOS, Android, Web).
```

---

## Technische Entscheidungen & Best Practices

### State Management Strategie:
- **Zustand**: Globaler Timer-State, UI-State (Modals, Sidebars)
- **React Query**: Server-State (Workshops, Sessions, Interactions)
- **Supabase Realtime**: Live-Updates für workshop_states

### Ordnerstruktur:
```
src/
├── components/
│   ├── moderator/      # Live-Ansicht, Control-Panel
│   ├── display/        # Beamer-Dashboard
│   ├── participant/    # Teilnehmer-App
│   ├── planner/        # Workshop-Editor
│   ├── shared/         # Timer, Buttons, etc.
│   ├── native/         # Native-spezifische Komponenten
│   └── web/            # Web-spezifische Komponenten
├── services/
│   ├── supabase.ts     # Client-Initialisierung
│   ├── workshop.ts     # CRUD-Operationen
│   └── realtime.ts     # WebSocket-Subscriptions
├── stores/
│   └── timerStore.ts   # Zustand Store
├── hooks/
│   ├── useTimer.ts
│   ├── useWorkshop.ts
│   └── useRealtime.ts
├── types/
│   └── database.ts     # Generierte Supabase-Types
└── utils/
    ├── time.ts         # Zeit-Berechnungen
    ├── buffer.ts       # Smart-Buffer-Logik
    └── platform.ts     # Platform-Detection-Helpers
```

### Deployment:
- **Web**: Vercel oder Netlify
- **iOS**: App Store via EAS Build
- **Android**: Google Play via EAS Build
- **OTA Updates**: Expo Updates für schnelle Fixes ohne Store-Review
- **Backend**: Supabase Cloud (PostgreSQL + Realtime + Storage + Edge Functions)

---

## Zeitschätzung (grob):
- Phase 1-2: 3-4 Tage (Fundament + Cross-Platform-Setup)
- Phase 3-4: 3-4 Tage (Core UI)
- Phase 5: 2-3 Tage (Planungs-Editor)
- Phase 6-7: 4-5 Tage (Teilnehmer-Features + Native APIs)
- Phase 8: 2-3 Tage (Material-Management)
- Phase 9: 2-3 Tage (Reporting)
- Phase 10: 3-4 Tage (Polish + Multi-Platform-Testing)

**Gesamt: ~21-30 Arbeitstage** (bei Vollzeit-Entwicklung)

---

## Nächster Schritt:
Beginne mit **Phase 1** und dem Prompt:
```
Initialisiere ein Expo-Projekt mit Web-Support und TypeScript. Konfiguriere NativeWind 
und Expo Router. Erstelle das Supabase-Datenbankschema für FlowState basierend auf dem 
definierten Modell. Implementiere die RLS-Policies für Moderatoren, Teilnehmer und 
Display-Modus. Generiere die TypeScript-Types und erstelle eine Service-Klasse 
'WorkshopService' mit CRUD-Operationen für Workshops und Sessions. Konfiguriere 
Supabase SDK mit Expo SecureStore.
```
