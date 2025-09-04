import { NextResponse } from 'next/server'
import { assignmentsApi } from '@/lib/neon'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { assignments } = body

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'assignments array is required' },
        { status: 400 }
      )
    }

    const result = await assignmentsApi.createMultiple(assignments)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating bulk assignments:', error)
    return NextResponse.json(
      { error: 'Failed to create bulk assignments' },
      { status: 500 }
    )
  }
}