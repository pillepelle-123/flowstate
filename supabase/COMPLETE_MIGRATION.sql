-- FlowState Database Schema - Komplette Migration
-- Phase 1: Fundament & Datenmodell
-- Kopiere dieses komplette SQL und führe es im Supabase SQL Editor aus

-- ============================================
-- SCHEMA & ENUMS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE workshop_buffer_strategy AS ENUM ('fixed', 'distributed', 'end');
CREATE TYPE session_type AS ENUM ('input', 'interaction', 'individual', 'group', 'break', 'orga');
CREATE TYPE workshop_status AS ENUM ('planned', 'running', 'paused', 'completed');
CREATE TYPE interaction_type AS ENUM ('vote_2d', 'sticky_note', 'ready_signal', 'help_request');

-- ============================================
-- TABLES
-- ============================================

-- Workshops (Hauptentität)
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER NOT NULL,
  buffer_strategy workshop_buffer_strategy DEFAULT 'distributed',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions (Workshop-Blöcke)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type session_type NOT NULL,
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  order_index INTEGER NOT NULL,
  description TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  method_template_id UUID,
  is_buffer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Workshop State (Echtzeit-Synchronisation)
CREATE TABLE workshop_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL UNIQUE REFERENCES workshops(id) ON DELETE CASCADE,
  current_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  status workshop_status DEFAULT 'planned',
  started_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  server_time_offset INTEGER DEFAULT 0,
  session_started_at TIMESTAMP WITH TIME ZONE,
  session_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teilnehmer (Anonymous Sessions)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  anonymous_id TEXT NOT NULL,
  display_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interaktionen (Votings, Sticky Notes, etc.)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Methoden-Bibliothek
CREATE TABLE method_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  default_duration INTEGER,
  description TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_sessions_workshop_id ON sessions(workshop_id);
CREATE INDEX idx_sessions_order ON sessions(workshop_id, order_index);
CREATE INDEX idx_workshop_states_workshop_id ON workshop_states(workshop_id);
CREATE INDEX idx_participants_workshop_id ON participants(workshop_id);
CREATE INDEX idx_interactions_session_id ON interactions(session_id);
CREATE INDEX idx_interactions_participant_id ON interactions(participant_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshop_states_updated_at BEFORE UPDATE ON workshop_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_method_templates_updated_at BEFORE UPDATE ON method_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE method_templates ENABLE ROW LEVEL SECURITY;

-- WORKSHOPS Policies
CREATE POLICY "Moderators can view own workshops"
  ON workshops FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Moderators can create workshops"
  ON workshops FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Moderators can update own workshops"
  ON workshops FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Moderators can delete own workshops"
  ON workshops FOR DELETE USING (auth.uid() = created_by);

-- SESSIONS Policies
CREATE POLICY "Moderators can view sessions of own workshops"
  ON sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = sessions.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Moderators can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = sessions.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Moderators can update sessions"
  ON sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = sessions.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Moderators can delete sessions"
  ON sessions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = sessions.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Participants can view sessions"
  ON sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM participants
    WHERE participants.workshop_id = sessions.workshop_id
    AND participants.id = auth.uid()
  ));

-- WORKSHOP_STATES Policies
CREATE POLICY "Moderators can manage workshop states"
  ON workshop_states FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = workshop_states.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Participants can view workshop states"
  ON workshop_states FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM participants
    WHERE participants.workshop_id = workshop_states.workshop_id
    AND participants.id = auth.uid()
  ));

CREATE POLICY "Display mode can view workshop states"
  ON workshop_states FOR SELECT USING (true);

-- PARTICIPANTS Policies
CREATE POLICY "Moderators can manage participants"
  ON participants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = participants.workshop_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Participants can view themselves"
  ON participants FOR SELECT USING (id = auth.uid());

CREATE POLICY "Participants can update themselves"
  ON participants FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Participants can join workshops"
  ON participants FOR INSERT WITH CHECK (id = auth.uid());

-- INTERACTIONS Policies
CREATE POLICY "Moderators can view interactions"
  ON interactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sessions
    JOIN workshops ON workshops.id = sessions.workshop_id
    WHERE sessions.id = interactions.session_id
    AND workshops.created_by = auth.uid()
  ));

CREATE POLICY "Participants can create interactions"
  ON interactions FOR INSERT WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Participants can view own interactions"
  ON interactions FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Display mode can view interactions"
  ON interactions FOR SELECT USING (true);

-- METHOD_TEMPLATES Policies
CREATE POLICY "Authenticated users can view method templates"
  ON method_templates FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can manage method templates"
  ON method_templates FOR ALL USING (auth.role() = 'authenticated');
