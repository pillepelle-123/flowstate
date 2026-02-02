-- Timer zurücksetzen für erneuten Test
UPDATE workshop_states
SET 
  current_session_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  status = 'running',
  session_started_at = NOW(),
  session_ends_at = NOW() + INTERVAL '15 minutes',
  started_at = NOW(),
  paused_at = NULL,
  server_time_offset = 0
WHERE workshop_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
