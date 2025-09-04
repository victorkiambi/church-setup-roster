# Migration from Supabase to Vercel Neon

This document outlines the migration process from Supabase to Vercel's Neon PostgreSQL database.

## Overview

The migration replaces:
- **Supabase Client** (`@supabase/supabase-js`) → **Neon Serverless** (`@neondatabase/serverless`)
- **Direct SQL queries** → **Drizzle ORM** with type-safe queries
- **Environment variables** → New `DATABASE_URL` for Neon connection

## Migration Steps

### 1. Set up Vercel Neon Database

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database** → **Neon**
3. Create a new database and copy the connection string
4. Add the connection string to your `.env.local`:
   ```env
   DATABASE_URL=your_neon_connection_string_here
   ```

### 2. Install New Dependencies

```bash
npm install @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit tsx
```

### 3. Generate Database Schema

```bash
npm run db:generate
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Migrate Your Data

If you have existing data in Supabase, run the migration script:

```bash
# Make sure your Supabase credentials are still in .env.local
npm run migrate:from-supabase
```

Alternatively, if starting fresh, seed the database:

```bash
npm run db:seed
```

### 6. Update Environment Variables

Remove or comment out the old Supabase environment variables:

```env
# Legacy Supabase Configuration (for migration reference)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# New Neon Database Configuration
DATABASE_URL=your_neon_connection_string_here
```

### 7. Test the Application

```bash
npm run dev
```

## Key Changes Made

### Database Schema (`src/lib/db/schema.ts`)
- Converted Supabase tables to Drizzle schema
- Maintained all relationships and indexes
- Updated field naming conventions (snake_case → camelCase)

### API Layer (`src/lib/neon.ts`)
- Replaced Supabase client with Drizzle queries
- Maintained the same API interface for compatibility
- Added proper error handling and type safety

### Field Name Changes
- `event_date` → `eventDate`
- `event_type` → `eventType`
- `team_id` → `teamId`
- `member_id` → `memberId`
- `event_id` → `eventId`
- `is_active` → `isActive`
- `is_archived` → `isArchived`
- `admin_name` → `adminName`
- `admin_phone` → `adminPhone`
- `created_at` → `createdAt`

### Updated Files
- All component imports updated from `@/lib/supabase` to `@/lib/neon`
- Direct database queries replaced with Drizzle queries
- Field references updated to match new schema

## Database Operations

### Available Scripts
- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Seed database with initial data
- `npm run migrate:from-supabase` - Migrate data from Supabase

### Schema Management
The database schema is defined in `src/lib/db/schema.ts`. Any changes to the schema should be followed by:

1. Generate new migration: `npm run db:generate`
2. Apply migration: `npm run db:migrate`

## Benefits of Migration

1. **Better Performance**: Neon's serverless architecture with connection pooling
2. **Type Safety**: Drizzle ORM provides full TypeScript support
3. **Cost Efficiency**: Pay-per-use pricing model
4. **Vercel Integration**: Native integration with Vercel platform
5. **Better Developer Experience**: Drizzle Studio for database management

## Rollback Plan

If you need to rollback to Supabase:

1. Restore the original `src/lib/supabase.ts` file
2. Update all imports back to `@/lib/supabase`
3. Restore original environment variables
4. Revert field name changes in components

## Support

For issues with the migration:
1. Check the Drizzle ORM documentation
2. Verify your Neon connection string
3. Ensure all environment variables are set correctly
4. Check the console for any TypeScript errors