-- Phase 5: Methoden-Bibliothek Beispieldaten
-- Füge vorgefertigte Workshop-Methoden hinzu

INSERT INTO method_templates (name, category, default_duration, description, instructions) VALUES
  ('Brainstorming', 'Ideenfindung', 20, 'Klassisches Brainstorming zur Ideensammlung', 'Sammelt in 5 Minuten so viele Ideen wie möglich. Keine Bewertung, nur Quantität!'),
  ('6-3-5 Methode', 'Ideenfindung', 30, 'Brainwriting-Methode für strukturierte Ideenentwicklung', '6 Teilnehmer entwickeln je 3 Ideen in 5 Minuten, dann Weitergabe'),
  ('World Café', 'Diskussion', 45, 'Moderierte Gruppendiskussion an mehreren Tischen', 'Rotiert alle 15 Minuten zwischen Tischen mit verschiedenen Fragestellungen'),
  ('Design Studio', 'Prototyping', 60, 'Schnelles Sketching und Feedback in Iterationen', 'Sketch → Present → Critique → Iterate'),
  ('Dot Voting', 'Entscheidung', 10, 'Demokratische Priorisierung durch Punktevergabe', 'Jeder Teilnehmer erhält 3 Punkte zum Verteilen'),
  ('Crazy 8s', 'Ideenfindung', 15, '8 Ideen in 8 Minuten skizzieren', 'Falte A4-Blatt 3x, zeichne 8 Varianten in je 1 Minute'),
  ('Lightning Talks', 'Präsentation', 30, 'Kurze 3-Minuten-Präsentationen', 'Jedes Team präsentiert in max. 3 Minuten'),
  ('Retrospektive', 'Reflexion', 25, 'Was lief gut? Was kann verbessert werden?', 'Start-Stop-Continue Format'),
  ('Energizer', 'Aktivierung', 5, 'Kurze Aktivierungsübung', 'Bewegung, Spiel oder Rätsel zur Auflockerung'),
  ('Silent Brainstorming', 'Ideenfindung', 15, 'Stilles Aufschreiben von Ideen', 'Jeder schreibt Ideen auf Sticky Notes, dann gemeinsames Clustern'),
  ('SWOT-Analyse', 'Analyse', 40, 'Stärken, Schwächen, Chancen, Risiken analysieren', 'Erstellt gemeinsam eine 2x2 Matrix'),
  ('User Story Mapping', 'Planung', 50, 'Visualisierung der User Journey', 'Ordnet Features entlang der Nutzerreise an'),
  ('Kaffee-Pause', 'Pause', 15, 'Kurze Erholungspause', 'Zeit für Kaffee, Snacks und informellen Austausch'),
  ('Mittagspause', 'Pause', 60, 'Mittagspause', 'Gemeinsames Mittagessen'),
  ('Check-In', 'Orga', 10, 'Ankommen und Einstimmen', 'Kurze Vorstellungsrunde oder Stimmungsabfrage'),
  ('Check-Out', 'Orga', 10, 'Abschluss und Feedback', 'Was nehme ich mit? Offene Fragen?')
ON CONFLICT DO NOTHING;
