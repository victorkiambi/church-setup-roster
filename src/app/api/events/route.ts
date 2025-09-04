import { NextResponse } from 'next/server'
import { eventsApi } from '@/lib/neon'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const type = searchParams.get('type') // 'upcoming', 'all', 'archived'
    const withAssignments = searchParams.get('withAssignments') === 'true'

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      )
    }

    let events
    if (withAssignments) {
      events = await eventsApi.getWithAssignments(teamId)
    } else {
      switch (type) {
        case 'upcoming':
          events = await eventsApi.getUpcoming(teamId)
          break
        case 'archived':
          events = await eventsApi.getArchived(teamId)
          break
        case 'all':
          events = await eventsApi.getAllIncludingArchived(teamId)
          break
        default:
          events = await eventsApi.getAll(teamId)
      }
    }
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = await eventsApi.create(body)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}