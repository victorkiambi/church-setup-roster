-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table  
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(20) DEFAULT 'sunday', -- 'sunday', 'special'
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

-- Insert sample members
INSERT INTO members (name, phone) VALUES 
('John Smith', '+254712345678'),
('Mary Johnson', '+254723456789'),
('David Brown', '+254734567890'),
('Sarah Wilson', '+254745678901');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events(is_archived, event_date) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_assignments_event_id ON assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_member_id ON assignments(member_id);

-- Insert next few Sundays
INSERT INTO events (title, event_date, event_type, is_archived) VALUES
('Sunday Service', '2024-12-15', 'sunday', false),
('Sunday Service', '2024-12-22', 'sunday', false),
('Sunday Service', '2024-12-29', 'sunday', false),
('Christmas Prep', '2024-12-20', 'special', false);

-- Sample assignments
INSERT INTO assignments (event_id, member_id) 
SELECT e.id, m.id 
FROM events e, members m 
WHERE e.event_date = '2024-12-15' AND m.name IN ('John Smith', 'Mary Johnson')
LIMIT 2;