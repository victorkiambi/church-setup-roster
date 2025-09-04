import { NextResponse } from 'next/server'
import { eventsApi } from '@/lib/neon'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teamId, year, month } = body

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      )
    }

    const events = await eventsApi.generateMissingSundaysForMonth(teamId, year, month)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error generating missing Sundays:', error)
    return NextResponse.json(
      { error: 'Failed to generate missing Sundays' },
      { status: 500 }
    )
  }
}