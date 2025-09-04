import { NextResponse } from 'next/server'
import { membersApi } from '@/lib/neon'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      )
    }

    const members = activeOnly 
      ? await membersApi.getActive(teamId)
      : await membersApi.getAll(teamId)
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const member = await membersApi.create(body)
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}