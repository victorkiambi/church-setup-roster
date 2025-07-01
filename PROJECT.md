# Simple Church Setup Roster - Streamlined Specification

## Core Purpose
**Mobile-friendly web app to show who's on setup duty and manage assignments**

## Tech Stack (Simplified)
- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui components
- **Database**: Supabase (free tier)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (free)
- **Cost**: $0

## Database Schema (3 Simple Tables)

```sql
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
```

## Pages (Only 3 Pages)

### 1. Homepage (`/`) - "Who's On Duty"
**Primary view optimized for mobile sharing**
```
📅 This Sunday (Dec 15)
👥 John Smith, Mary Johnson

📅 Next Sunday (Dec 22)  
👥 David Brown, Sarah Wilson

🎯 Special Events
📅 Friday Dec 20 - Christmas Prep
👥 John Smith, David Brown
```

**Features:**
- Shows next 2-3 Sundays
- Special events (Fridays/Saturdays)
- Large, readable text for mobile
- WhatsApp share button

### 2. Members (`/members`) - Quick Add/Manage
**Simple list with add button**
- shadcn/ui Table component
- Add Member dialog (name + phone only)
- Toggle active/inactive
- No complex forms

### 3. Events (`/events`) - Create Events & Assign
**Two sections:**
- **Sundays**: Auto-generate next 8 weeks, assign people
- **Special Events**: Add Friday/Saturday events manually

**Assignment UI:**
- Click event → Select 2-3 people from dropdown
- Visual feedback (assigned/unassigned)
- Mobile-friendly touch targets

## Key Components (shadcn/ui)

```typescript
// Main components needed
- Card (for duty display)
- Button (actions)
- Dialog (add member/event)
- Select (member assignment)
- Table (members list)
- Calendar (optional date picker)
```

## File Structure (Minimal)
```
app/
├── page.tsx              // Homepage (duty view)
├── members/page.tsx      // Members management  
├── events/page.tsx       // Events & assignments
├── components/
│   ├── duty-card.tsx     // Sunday duty display
│   ├── add-member.tsx    // Add member dialog
│   └── assign-members.tsx // Assignment interface
├── lib/
│   ├── supabase.ts       // DB config
│   └── utils.ts          // Helper functions
└── globals.css           // Tailwind styles
```

## User Flows

### Primary Flow (90% usage)
1. Open WhatsApp link → Homepage
2. See "Who's on duty this Sunday"
3. Done ✅

### Admin Flows (10% usage)
1. **Add member**: Members page → Add Member button → Name + Phone → Save
2. **Create special event**: Events page → Add Event → Friday/Saturday date → Assign 2-3 people
3. **Weekly assignment**: Events page → Click unassigned Sunday → Select people

## Environment Setup
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Mobile Optimization
- Responsive breakpoints (shadcn handles this)
- Touch-friendly buttons (min 44px)
- Large readable fonts
- Fast loading (Next.js optimization)
- WhatsApp sharing meta tags

## Deployment (Free)
1. **Supabase**: Create project + tables (free tier)
2. **Vercel**: Connect GitHub repo (free plan)
3. **Domain**: Use Vercel subdomain or custom domain
4. **Sharing**: Direct WhatsApp link to homepage

## MVP Feature List (Build in Order)
1. ✅ Homepage showing Sunday duties
2. ✅ Add/list members 
3. ✅ Create and assign Sunday services
4. ✅ Add special events (Fridays/Saturdays)
5. ✅ Mobile responsive design
6. ✅ WhatsApp sharing

**That's it.** Simple, focused, $0 cost, mobile-first.

## Sample Data
```sql
-- Insert sample members
INSERT INTO members (name, phone) VALUES 
('John Smith', '+254712345678'),
('Mary Johnson', '+254723456789'),
('David Brown', '+254734567890');

-- Insert next few Sundays
INSERT INTO events (title, event_date, event_type) VALUES
('Sunday Service', '2024-12-15', 'sunday'),
('Sunday Service', '2024-12-22', 'sunday'),
('Christmas Prep', '2024-12-20', 'special');
```

## Success Criteria
- ✅ Load homepage in <2 seconds on mobile
- ✅ WhatsApp link shows preview with duty info
- ✅ Add new member in <30 seconds
- ✅ Assign Sunday duty in <1 minute
- ✅ Works on any phone browser
- ✅ Zero monthly costs
