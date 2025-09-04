/**
 * Migration script to move data from Supabase to Neon
 * Run this after setting up your Neon database
 */

import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { db, teams, members, events, assignments } from '../src/lib/db'

// Supabase client for data export
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateData() {
  console.log('Starting migration from Supabase to Neon...')

  try {
    // 1. Migrate Teams
    console.log('Migrating teams...')
    const { data: supabaseTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at')
    
    if (teamsError) throw teamsError
    
    if (supabaseTeams && supabaseTeams.length > 0) {
      await db.insert(teams).values(
        supabaseTeams.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          adminName: team.admin_name,
          adminPhone: team.admin_phone,
          color: team.color,
          isActive: team.is_active,
          createdAt: new Date(team.created_at)
        }))
      )
      console.log(`Migrated ${supabaseTeams.length} teams`)
    }

    // 2. Migrate Members
    console.log('Migrating members...')
    const { data: supabaseMembers, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('created_at')
    
    if (membersError) throw membersError
    
    if (supabaseMembers && supabaseMembers.length > 0) {
      await db.insert(members).values(
        supabaseMembers.map(member => ({
          id: member.id,
          name: member.name,
          phone: member.phone,
          teamId: member.team_id,
          isActive: member.is_active,
          createdAt: new Date(member.created_at)
        }))
      )
      console.log(`Migrated ${supabaseMembers.length} members`)
    }

    // 3. Migrate Events
    console.log('Migrating events...')
    const { data: supabaseEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at')
    
    if (eventsError) throw eventsError
    
    if (supabaseEvents && supabaseEvents.length > 0) {
      await db.insert(events).values(
        supabaseEvents.map(event => ({
          id: event.id,
          title: event.title,
          eventDate: event.event_date,
          eventType: event.event_type,
          teamId: event.team_id,
          isArchived: event.is_archived,
          createdAt: new Date(event.created_at)
        }))
      )
      console.log(`Migrated ${supabaseEvents.length} events`)
    }

    // 4. Migrate Assignments
    console.log('Migrating assignments...')
    const { data: supabaseAssignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at')
    
    if (assignmentsError) throw assignmentsError
    
    if (supabaseAssignments && supabaseAssignments.length > 0) {
      await db.insert(assignments).values(
        supabaseAssignments.map(assignment => ({
          id: assignment.id,
          eventId: assignment.event_id,
          memberId: assignment.member_id,
          createdAt: new Date(assignment.created_at)
        }))
      )
      console.log(`Migrated ${supabaseAssignments.length} assignments`)
    }

    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData()
}