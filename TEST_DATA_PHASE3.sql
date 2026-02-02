-- Phase 3 Test-Daten
-- Führe dieses Script in der Supabase SQL Editor aus

-- 1. Test-Workshop erstellen
INSERT INTO workshops (id, title, description, date, total_duration, buffer_strategy)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Design Thinking Workshop',
  'Ein interaktiver Workshop zum Testen der Moderator-Ansicht',
  NOW() + INTERVAL '1 day',
  180,
  'distributed'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 2. Sessions erstellen
INSERT INTO sessions (id, workshop_id, title, type, planned_duration, order_index, is_buffer, description)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Begrüßung & Intro', 'input', 15, 0, false, 'Vorstellung und Agenda durchgehen'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Puffer 1', 'break', 10, 1, true, 'Zeitpuffer für Verspätungen'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brainstorming', 'interaction', 30, 2, false, 'Ideen sammeln mit Sticky Notes'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Puffer 2', 'break', 10, 3, true, 'Zeitpuffer'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Prototyping', 'group', 45, 4, false, 'Prototypen in Gruppen bauen'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Präsentation', 'input', 30, 5, false, 'Ergebnisse vorstellen')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 3. Workshop State initialisieren
INSERT INTO workshop_states (workshop_id, status)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'planned')
ON CONFLICT (workshop_id) DO UPDATE SET
  status = 'planned',
  current_session_id = NULL,
  session_started_at = NULL,
  session_ends_at = NULL;

-- 4. Erste Session starten (für sofortigen Test)
UPDATE workshop_states
SET 
  current_session_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  status = 'running',
  session_started_at = NOW(),
  session_ends_at = NOW() + INTERVAL '15 minutes',
  started_at = NOW(),
  server_time_offset = 0
WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Prüfe die Daten
SELECT * FROM workshops WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
