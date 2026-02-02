# FlowState - Workshop-Betriebssystem

Cross-Platform Workshop-Management-App (iOS, Android, Web) mit Echtzeit-Synchronisation.

## Phase 1: Fundament & Datenmodell ✅

### Setup

1. **Dependencies installieren:**
   ```bash
   cd flowstate
   npm install
   ```

2. **Supabase Projekt erstellen:**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt
   - Kopiere URL und Anon Key

3. **Environment-Variablen:**
   ```bash
   cp .env.example .env
   ```
   Füge deine Supabase-Credentials ein.

4. **Datenbank-Schema anwenden:**
   - Öffne Supabase SQL Editor
   - Führe `supabase/migrations/001_initial_schema.sql` aus
   - Führe `supabase/migrations/002_rls_policies.sql` aus

### Entwicklung starten

```bash
# Web
npm run web

# iOS (macOS + Xcode erforderlich)
npm run ios

# Android (Android Studio erforderlich)
npm run android
```

## Projektstruktur

```
flowstate/
├── app/                    # Expo Router Pages
├── src/
│   ├── components/
│   │   ├── moderator/     # Live-Ansicht, Control-Panel
│   │   ├── display/       # Beamer-Dashboard
│   │   ├── participant/   # Teilnehmer-App
│   │   ├── planner/       # Workshop-Editor
│   │   ├── shared/        # Gemeinsame Komponenten
│   │   ├── native/        # Native-spezifisch
│   │   └── web/           # Web-spezifisch
│   ├── services/
│   │   ├── supabase.ts    # Client-Initialisierung
│   │   └── workshop.ts    # CRUD-Operationen
│   ├── stores/            # Zustand State Management
│   ├── hooks/             # Custom React Hooks
│   ├── types/
│   │   └── database.ts    # TypeScript Types
│   └── utils/
│       └── platform.ts    # Platform Detection
└── supabase/
    └── migrations/        # SQL Schema & RLS Policies
```

## Tech Stack

- **Framework:** Expo + React Native
- **Routing:** Expo Router
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **State:** Zustand + React Query
- **Auth:** Supabase Auth + Expo SecureStore
- **TypeScript:** Vollständig typisiert

## Nächste Schritte

Phase 2: Echtzeit-Timer-Engine mit WebSocket-Anbindung
