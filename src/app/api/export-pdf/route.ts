import { NextRequest, NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'
import { type Event, type Member } from '@/lib/db'
import { formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#3B82F6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  eventSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 5,
  },
  eventType: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    padding: '4 8',
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  membersHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#D1D5DB',
    paddingBottom: 5,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8 0',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#F3F4F6',
  },
  memberName: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  memberPhone: {
    fontSize: 11,
    color: '#6B7280',
  },
  noMembers: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#E5E7EB',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
})

interface EventWithAssignments extends Event {
  assignments: Array<{ id: string; member: Member }>
}

async function getEventWithAssignments(eventId: string): Promise<EventWithAssignments | null> {
  try {
    const { getDb } = await import('@/lib/db')
    const database = getDb()
    
    const event = await database.query.events.findFirst({
      where: (events, { eq }) => eq(events.id, eventId),
      with: {
        assignments: {
          with: {
            member: true
          }
        }
      }
    })

    return event as EventWithAssignments | null
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

function createEventPDF(event: EventWithAssignments) {
  const assignedMembers = event.assignments?.filter(a => a.member).map(a => a.member!) || []
  
  return React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Church Setup Roster'),
        React.createElement(Text, { style: styles.subtitle }, 'Event Assignment Details')
      ),
      React.createElement(View, { style: styles.eventSection },
        React.createElement(Text, { style: styles.eventTitle }, event.title),
        React.createElement(Text, { style: styles.eventDate }, formatDate(event.eventDate)),
        React.createElement(View, { style: styles.eventType },
          React.createElement(Text, {}, event.eventType === 'sunday' ? 'Sunday Service' : 'Special Event')
        ),
        React.createElement(Text, { style: styles.membersHeader }, 
          `Assigned Members (${assignedMembers.length})`
        ),
        assignedMembers.length > 0 
          ? assignedMembers.map((member) => 
              React.createElement(View, { key: member.id, style: styles.memberRow },
                React.createElement(Text, { style: styles.memberName }, member.name),
                React.createElement(Text, { style: styles.memberPhone }, member.phone || 'No phone')
              )
            )
          : React.createElement(Text, { style: styles.noMembers }, 'No members assigned to this event')
      ),
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, { style: styles.footerText },
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
        ),
        React.createElement(Text, { style: styles.footerText },
          'Church Setup Roster Management System'
        )
      )
    )
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const event = await getEventWithAssignments(eventId)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const pdfDoc = pdf(createEventPDF(event))
    const pdfStream = await pdfDoc.toBlob()

    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_${event.eventDate}.pdf`

    return new Response(pdfStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}