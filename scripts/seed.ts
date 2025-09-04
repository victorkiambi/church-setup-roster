/**
 * Seed script for Neon database
 * Creates initial teams and sample data
 */

import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

import { db, teams, members, events, assignments } from '../src/lib/db'

async function seed() {
  console.log('Seeding Neon database...')

  try {
    // Insert default teams
    const defaultTeams = await db.insert(teams).values([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Setup Team',
        description: 'Church setup and logistics team',
        adminName: 'Setup Admin',
        color: '#3B82F6',
        isActive: true
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Media Team',
        description: 'Audio, video, and livestream team',
        adminName: 'Media Admin',
        color: '#10B981',
        isActive: true
      }
    ]).returning()

    console.log(`Created ${defaultTeams.length} teams`)

    // Insert sample members
    const sampleMembers = await db.insert(members).values([
      {
        name: 'John Smith',
        phone: '+254712345678',
        teamId: '11111111-1111-1111-1111-111111111111'
      },
      {
        name: 'Mary Johnson',
        phone: '+254723456789',
        teamId: '11111111-1111-1111-1111-111111111111'
      },
      {
        name: 'David Brown',
        phone: '+254734567890',
        teamId: '22222222-2222-2222-2222-222222222222'
      },
      {
        name: 'Sarah Wilson',
        phone: '+254745678901',
        teamId: '22222222-2222-2222-2222-222222222222'
      }
    ]).returning()

    console.log(`Created ${sampleMembers.length} members`)

    // Insert sample events
    const sampleEvents = await db.insert(events).values([
      {
        title: 'Sunday Service',
        eventDate: '2024-12-15',
        eventType: 'sunday',
        teamId: '11111111-1111-1111-1111-111111111111',
        isArchived: false
      },
      {
        title: 'Sunday Service',
        eventDate: '2024-12-22',
        eventType: 'sunday',
        teamId: '11111111-1111-1111-1111-111111111111',
        isArchived: false
      },
      {
        title: 'Sunday Service',
        eventDate: '2024-12-29',
        eventType: 'sunday',
        teamId: '11111111-1111-1111-1111-111111111111',
        isArchived: false
      },
      {
        title: 'Christmas Prep',
        eventDate: '2024-12-20',
        eventType: 'special',
        teamId: '11111111-1111-1111-1111-111111111111',
        isArchived: false
      }
    ]).returning()

    console.log(`Created ${sampleEvents.length} events`)

    // Create sample assignments for the first event
    if (sampleEvents.length > 0 && sampleMembers.length >= 2) {
      const firstEvent = sampleEvents[0]
      const setupMembers = sampleMembers.filter(m => m.teamId === '11111111-1111-1111-1111-111111111111')
      
      if (setupMembers.length >= 2) {
        const sampleAssignments = await db.insert(assignments).values([
          {
            eventId: firstEvent.id,
            memberId: setupMembers[0].id
          },
          {
            eventId: firstEvent.id,
            memberId: setupMembers[1].id
          }
        ]).returning()

        console.log(`Created ${sampleAssignments.length} assignments`)
      }
    }

    console.log('Database seeded successfully!')
    
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
}