# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Simple Church Setup Roster - a mobile-friendly web app to show who's on setup duty and manage assignments. The project is designed to be zero-cost and mobile-first.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui components 
- **Database**: Supabase (free tier)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (free)

## Development Commands

Since this appears to be a new project without existing package.json, standard Next.js commands would apply:
```bash
npm install
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Architecture

### Database Schema (3 Simple Tables)
- **members**: id, name, phone, is_active, created_at
- **events**: id, title, event_date, event_type ('sunday'|'special'), created_at  
- **assignments**: id, event_id, member_id, created_at (with foreign keys)

### Application Structure
The app has only 3 main pages:

1. **Homepage (`/`)** - "Who's On Duty" view
   - Primary mobile-optimized view showing next 2-3 Sundays
   - Special events display
   - WhatsApp share functionality

2. **Members (`/members`)** - Member management
   - Simple table with add/edit/toggle active functionality
   - Minimal form (name + phone only)

3. **Events (`/events`)** - Event creation and assignment
   - Auto-generate Sunday services (next 8 weeks)
   - Add special events (Fridays/Saturdays)
   - Assignment interface for selecting 2-3 people per event

### Key Components (shadcn/ui)
- Card (duty display)
- Button (actions)
- Dialog (add member/event)
- Select (member assignment)
- Table (members list)
- Calendar (optional date picker)

### File Structure
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

## Environment Setup

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Design Principles

- **Mobile-first**: Optimized for phone browsers with large touch targets (min 44px)
- **Simple**: Focus on core functionality only
- **Fast**: Target <2 second load time on mobile
- **Zero-cost**: Designed to run entirely on free tiers
- **WhatsApp integration**: Homepage should be shareable with preview

## Development Priority

Build features in this order:
1. Homepage showing Sunday duties
2. Add/list members 
3. Create and assign Sunday services
4. Add special events (Fridays/Saturdays)
5. Mobile responsive design
6. WhatsApp sharing meta tags