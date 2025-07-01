-- Add is_archived column to events table for soft deletion
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);

-- Partial index for active events (most common query)
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events(is_archived, event_date) 
WHERE is_archived = false;

-- Index for assignments performance
CREATE INDEX IF NOT EXISTS idx_assignments_event_id ON assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_member_id ON assignments(member_id);

-- Set all existing events as not archived
UPDATE events SET is_archived = false WHERE is_archived IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN events.is_archived IS 'Soft delete flag - true when event is archived, false when active';