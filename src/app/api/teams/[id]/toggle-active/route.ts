import { NextResponse } from 'next/server'
import { teamsApi } from '@/lib/neon'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    const team = await teamsApi.toggleActive(params.id, isActive)
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error toggling team status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle team status' },
      { status: 500 }
    )
  }
}