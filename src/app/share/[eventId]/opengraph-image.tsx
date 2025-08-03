import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'
export const alt = 'Church Setup Event'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { eventId: string } }) {
  try {
    // Get the event first to find its team_id
    const { data: eventData } = await supabase
      .from('events')
      .select(`
        *,
        team:teams(*),
        assignments (
          id,
          member:members (
            id,
            name,
            phone,
            team_id
          )
        )
      `)
      .eq('id', params.eventId)
      .single()
    
    const event = eventData
    
    if (!event) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Event Not Found
          </div>
        ),
        { ...size }
      )
    }

    const assignedMembers = event.assignments?.map((a: { member: { name: string } }) => a.member.name) || []
    const memberText = assignedMembers.length > 0 
      ? assignedMembers.join(', ')
      : 'No assignments yet'

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            🏛️ {event.title}
          </div>
          <div
            style={{
              fontSize: 48,
              marginBottom: '40px',
              opacity: 0.9,
            }}
          >
            📅 {formatDate(event.event_date)}
          </div>
          <div
            style={{
              fontSize: 36,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '20px 40px',
              borderRadius: '20px',
              maxWidth: '800px',
            }}
          >
            👥 {memberText}
          </div>
          <div
            style={{
              fontSize: 24,
              marginTop: '40px',
              opacity: 0.8,
            }}
          >
            {event.team?.name || 'Church'} Roster
          </div>
        </div>
      ),
      { ...size }
    )
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Church Roster
        </div>
      ),
      { ...size }
    )
  }
}