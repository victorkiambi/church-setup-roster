import { NextResponse } from 'next/server'
import { assignmentsApi } from '@/lib/neon'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }

    const assignments = await assignmentsApi.getByEvent(eventId)
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const assignment = await assignmentsApi.create(body)
    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }

    await assignmentsApi.deleteByEvent(eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignments:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignments' },
      { status: 500 }
    )
  }
}