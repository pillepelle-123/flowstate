-- FlowState Database Schema
-- Phase 1: Fundament & Datenmodell

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE workshop_buffer_strategy AS ENUM ('fixed', 'distributed', 'end');
CREATE TYPE session_type AS ENUM ('input', 'interaction', 'individual', 'group', 'break', 'orga');
CREATE TYPE workshop_status AS ENUM ('planned', 'running', 'paused', 'completed');
CREATE TYPE interaction_type AS ENUM ('vote_2d', 'sticky_note', 'ready_signal', 'help_request');

-- Workshops (Hauptentität)
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER NOT NULL, -- Minuten
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
  planned_duration INTEGER NOT NULL, -- Minuten
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
  server_time_offset INTEGER DEFAULT 0, -- Millisekunden
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
  default_duration INTEGER, -- Minuten
  description TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX idx_sessions_workshop_id ON sessions(workshop_id);
CREATE INDEX idx_sessions_order ON sessions(workshop_id, order_index);
CREATE INDEX idx_workshop_states_workshop_id ON workshop_states(workshop_id);
CREATE INDEX idx_participants_workshop_id ON participants(workshop_id);
CREATE INDEX idx_interactions_session_id ON interactions(session_id);
CREATE INDEX idx_interactions_participant_id ON interactions(participant_id);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshop_states_updated_at BEFORE UPDATE ON workshop_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_method_templates_updated_at BEFORE UPDATE ON method_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
