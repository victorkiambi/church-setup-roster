# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Simple Church Setup Roster - a mobile-friendly web app to show who's on setup duty and manage assignments. The project is designed to be zero-cost and mobile-first.

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **UI**: shadcn/ui components with Radix UI primitives
- **Database**: Supabase (free tier)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (free)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Development Commands

```bash
npm install
npm run dev        # Start development server with Turbopack
npm run build      # Build for production (required before deployment)
npm run start      # Start production server
npm run lint       # Run ESLint
```

**Important**: Always run `npm run build` after making changes to verify no build errors exist.

## Architecture

### Database Schema (3 Core Tables)
- **members**: id, name, phone, is_active, created_at
- **events**: id, title, event_date, event_type ('sunday'|'special'), is_archived, created_at  
- **assignments**: id, event_id, member_id, created_at (with foreign keys)

### Application Structure
The app has 3 main pages plus API routes:

1. **Homepage (`/`)** - "Who's On Duty" view
   - Shows all current month Sunday services
   - Auto-generates missing Sundays on page load
   - Special events display
   - WhatsApp share functionality

2. **Members (`/members`)** - Member management
   - Simple table with add/edit/toggle active functionality
   - Minimal form (name + phone only)

3. **Events (`/events`)** - Event creation and assignment
   - Organized by current month Sundays (highlighted) vs other Sundays
   - Auto-generate Sunday services functionality
   - Add special events (Fridays/Saturdays)
   - Assignment interface for selecting members per event
   - Archive/delete functionality

4. **API Routes**:
   - `/api/auto-archive` - Server-side event archiving fallback

### Key Architectural Patterns

#### Sunday Generation System
- **Client-side**: `eventsApi.generateMissingSundaysForMonth()` automatically creates missing Sunday events
- **Timezone-safe**: Uses `formatDateString()` to avoid UTC conversion issues that could create Saturday events
- **Monthly focus**: Generates all Sundays for current month, preserving existing events and assignments
- **Automatic**: Runs on homepage load to ensure completeness

#### Auto-Archive System
- **Dual approach**: Client-side via `auto-archive.ts` + server-side fallback via API route
- **Automatic**: Runs on page loads to archive past events
- **Preserves data**: Archived events retain all assignment information

#### Data APIs Structure
All database operations centralized in `src/lib/supabase.ts`:
- `membersApi`: CRUD operations for members
- `eventsApi`: Event management including Sunday generation and archiving
- `assignmentsApi`: Assignment management between events and members

### Key Components (shadcn/ui)
- **DutyCard**: Core component displaying event assignments with WhatsApp sharing
- **AssignMembers**: Dynamic member assignment interface
- **DeleteConfirmation**: Reusable confirmation dialog for archive/delete actions
- **LoadingSkeleton**: Loading states for all data components

### Critical Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side operations
```

## Design Principles

- **Mobile-first**: Optimized for phone browsers with large touch targets (min 44px)
- **Simple**: Focus on core functionality only
- **Fast**: Target <2 second load time on mobile
- **Zero-cost**: Designed to run entirely on free tiers
- **Data integrity**: All operations preserve existing assignments and member data
- **Timezone-aware**: All date operations use local timezone to prevent day-shifting issues

## Important Implementation Details

### Sunday Event Logic
- Uses `getAllSundaysInMonth()` to calculate all Sundays for a given month
- `generateMissingSundaysForMonth()` only creates events that don't already exist
- Homepage automatically shows all current month Sundays
- Events page separates current month (highlighted) from other months

### Date Handling
- **Critical**: Use `formatDateString()` for all date-to-string conversions
- **Avoid**: `toISOString().split('T')[0]` as it causes timezone shifts
- All date comparisons should use local timezone, not UTC

### Error Handling
- Auto-archive has dual fallback: client-side → server-side API
- All API operations include proper error handling and user feedback
- Build process must pass before deployment

### Component Patterns
- All data components use loading skeletons
- Confirmation dialogs for destructive actions
- Mobile-responsive cards and layouts throughout
- Consistent badge usage for event types and statuses

## File Structure
```
src/
├── app/
│   ├── page.tsx              // Homepage with current month Sundays
│   ├── members/page.tsx      // Member management  
│   ├── events/page.tsx       // Events with monthly organization
│   ├── api/auto-archive/     // Server-side archiving
│   └── share/[eventId]/      // WhatsApp sharing pages
├── components/
│   ├── duty-card.tsx         // Main event display component
│   ├── assign-members.tsx    // Member assignment interface
│   └── ui/                   // shadcn/ui components
├── lib/
│   ├── supabase.ts           // All database operations
│   ├── auto-archive.ts       // Client-side archiving logic
│   └── utils.ts              // Date utilities and helpers
```