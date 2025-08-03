-- Migration: Add Teams Support
-- This migration adds multi-team support to the roster system
-- Date: 2025-08-03

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  admin_name VARCHAR(100),
  admin_phone VARCHAR(20),
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for team branding
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add team_id to existing tables
ALTER TABLE members ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);

-- Insert default teams (Setup and Media)
INSERT INTO teams (id, name, description, admin_name, color, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'Setup Team', 'Church setup and logistics team', 'Setup Admin', '#3B82F6', true),
('22222222-2222-2222-2222-222222222222', 'Media Team', 'Audio, video, and livestream team', 'Media Admin', '#10B981', true);

-- Migrate existing data to Setup Team (preserving all current data)
UPDATE members SET team_id = '11111111-1111-1111-1111-111111111111' WHERE team_id IS NULL;
UPDATE events SET team_id = '11111111-1111-1111-1111-111111111111' WHERE team_id IS NULL;

-- Make team_id NOT NULL after migration
ALTER TABLE members ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN team_id SET NOT NULL;

-- Add compound indexes for team-filtered queries
CREATE INDEX IF NOT EXISTS idx_members_team_active ON members(team_id, is_active);
CREATE INDEX IF NOT EXISTS idx_events_team_archived ON events(team_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_events_team_date ON events(team_id, event_date);