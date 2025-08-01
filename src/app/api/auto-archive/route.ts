import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role key for server-side operations, fallback to anon key if service key not available
const supabase = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST() {
  try {
    // Validate environment variables
    if (!supabaseUrl) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase key environment variables')
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase keys' },
        { status: 500 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    console.log('Server-side auto-archiving events before:', today)

    const { data, error } = await supabase
      .from('events')
      .update({ is_archived: true })
      .lt('event_date', today)
      .eq('is_archived', false)
      .select()

    if (error) {
      console.error('Supabase error in auto-archive API:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Database operation failed', details: error.message },
        { status: 500 }
      )
    }

    console.log('Server-side auto-archive successful, updated events:', data?.length || 0)
    
    return NextResponse.json({
      success: true,
      archivedCount: data?.length || 0,
      message: `Successfully archived ${data?.length || 0} past events`
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