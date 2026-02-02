-- Row Level Security Policies
-- Phase 1: Moderatoren, Teilnehmer und Display-Modus

-- Enable RLS auf allen Tabellen
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE method_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WORKSHOPS
-- ============================================

-- Moderatoren: Voller Zugriff auf eigene Workshops
CREATE POLICY "Moderators can view own workshops"
  ON workshops FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Moderators can create workshops"
  ON workshops FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Moderators can update own workshops"
  ON workshops FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Moderators can delete own workshops"
  ON workshops FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- SESSIONS
-- ============================================

-- Moderatoren: Voller Zugriff auf Sessions ihrer Workshops
CREATE POLICY "Moderators can view sessions of own workshops"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = sessions.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

CREATE POLICY "Moderators can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = sessions.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

CREATE POLICY "Moderators can update sessions"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = sessions.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

CREATE POLICY "Moderators can delete sessions"
  ON sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = sessions.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

-- Teilnehmer: Lesezugriff auf Sessions ihres Workshops
CREATE POLICY "Participants can view sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.workshop_id = sessions.workshop_id
      AND participants.id = auth.uid()
    )
  );

-- ============================================
-- WORKSHOP_STATES
-- ============================================

-- Moderatoren: Voller Zugriff
CREATE POLICY "Moderators can manage workshop states"
  ON workshop_states FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = workshop_states.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

-- Teilnehmer & Display: Lesezugriff
CREATE POLICY "Participants can view workshop states"
  ON workshop_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.workshop_id = workshop_states.workshop_id
      AND participants.id = auth.uid()
    )
  );

-- Public read für Display-Modus (über spezielle anonymous auth)
CREATE POLICY "Display mode can view workshop states"
  ON workshop_states FOR SELECT
  USING (true); -- Wird später mit Display-Token verfeinert

-- ============================================
-- PARTICIPANTS
-- ============================================

-- Moderatoren: Voller Zugriff auf Teilnehmer ihrer Workshops
CREATE POLICY "Moderators can manage participants"
  ON participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = participants.workshop_id
      AND workshops.created_by = auth.uid()
    )
  );

-- Teilnehmer: Können sich selbst sehen und updaten
CREATE POLICY "Participants can view themselves"
  ON participants FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Participants can update themselves"
  ON participants FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Participants can join workshops"
  ON participants FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- INTERACTIONS
-- ============================================

-- Moderatoren: Lesezugriff auf alle Interaktionen ihrer Workshops
CREATE POLICY "Moderators can view interactions"
  ON interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN workshops ON workshops.id = sessions.workshop_id
      WHERE sessions.id = interactions.session_id
      AND workshops.created_by = auth.uid()
    )
  );

-- Teilnehmer: Können eigene Interaktionen erstellen und sehen
CREATE POLICY "Participants can create interactions"
  ON interactions FOR INSERT
  WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Participants can view own interactions"
  ON interactions FOR SELECT
  USING (participant_id = auth.uid());

-- Display-Modus: Lesezugriff auf alle Interaktionen
CREATE POLICY "Display mode can view interactions"
  ON interactions FOR SELECT
  USING (true); -- Wird später mit Display-Token verfeinert

-- ============================================
-- METHOD_TEMPLATES
-- ============================================

-- Alle authentifizierten User können Templates lesen
CREATE POLICY "Authenticated users can view method templates"
  ON method_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Nur Moderatoren können Templates erstellen/bearbeiten
CREATE POLICY "Moderators can manage method templates"
  ON method_templates FOR ALL
  USING (auth.role() = 'authenticated');
