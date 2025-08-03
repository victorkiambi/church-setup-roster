-- Teams table
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

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table  
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(20) DEFAULT 'sunday', -- 'sunday', 'special'
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Insert default teams
INSERT INTO teams (id, name, description, admin_name, color, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'Setup Team', 'Church setup and logistics team', 'Setup Admin', '#3B82F6', true),
('22222222-2222-2222-2222-222222222222', 'Media Team', 'Audio, video, and livestream team', 'Media Admin', '#10B981', true);

-- Insert sample members
INSERT INTO members (name, phone, team_id) VALUES 
('John Smith', '+254712345678', '11111111-1111-1111-1111-111111111111'),
('Mary Johnson', '+254723456789', '11111111-1111-1111-1111-111111111111'),
('David Brown', '+254734567890', '22222222-2222-2222-2222-222222222222'),
('Sarah Wilson', '+254745678901', '22222222-2222-2222-2222-222222222222');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_team_active ON members(team_id, is_active);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_team_archived ON events(team_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_events_team_date ON events(team_id, event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events(is_archived, event_date) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_assignments_event_id ON assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_member_id ON assignments(member_id);

-- Insert next few Sundays for Setup Team
INSERT INTO events (title, event_date, event_type, team_id, is_archived) VALUES
('Sunday Service', '2024-12-15', 'sunday', '11111111-1111-1111-1111-111111111111', false),
('Sunday Service', '2024-12-22', 'sunday', '11111111-1111-1111-1111-111111111111', false),
('Sunday Service', '2024-12-29', 'sunday', '11111111-1111-1111-1111-111111111111', false),
('Christmas Prep', '2024-12-20', 'special', '11111111-1111-1111-1111-111111111111', false);

-- Sample assignments
INSERT INTO assignments (event_id, member_id) 
SELECT e.id, m.id 
FROM events e, members m 
WHERE e.event_date = '2024-12-15' AND m.name IN ('John Smith', 'Mary Johnson')
LIMIT 2;