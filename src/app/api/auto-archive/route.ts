import { NextResponse } from 'next/server'
import { db, events } from '@/lib/db'
import { and, lt, eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    // Validate database connection
    if (!process.env.DATABASE_URL) {
      console.error('Missing DATABASE_URL environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: Missing database URL' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { teamId } = body

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    console.log('Server-side auto-archiving events before:', today, 'for team:', teamId)

    const archivedEvents = await db
      .update(events)
      .set({ isArchived: true })
      .where(and(
        eq(events.teamId, teamId),
        lt(events.eventDate, today),
        eq(events.isArchived, false)
      ))
      .returning()

    console.log('Server-side auto-archive successful, updated events:', archivedEvents.length)
    
    return NextResponse.json({
      success: true,
      archivedCount: archivedEvents.length,
      archivedEvents,
      message: `Successfully archived ${archivedEvents.length} past events`
    })

  } catch (error) {
    console.error('Exception in auto-archive API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error,
      constructor: error?.constructor?.name
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 