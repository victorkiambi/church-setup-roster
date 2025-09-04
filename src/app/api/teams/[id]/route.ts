import { NextResponse } from 'next/server'
import { teamsApi } from '@/lib/neon'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const team = await teamsApi.getById(params.id)
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Team not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const team = await teamsApi.update(params.id, body)
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}