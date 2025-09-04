import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { type Event, type Member } from './neon'

type EventWithAssignments = Event & { assignments: Array<{ id: string; member: Member }> }

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  specialEventItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fef3e2',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  eventLeft: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 9,
    color: '#374151',
    backgroundColor: '#e5e7eb',
    padding: '2 6',
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  eventRight: {
    flex: 1,
    marginLeft: 20,
  },
  assignmentsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 2,
  },
  noAssignments: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  summary: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9ca3af',
  },
})

interface PDFDocumentProps {
  events: EventWithAssignments[]
  month: string
  year: number
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ events, month, year }) => {
  const sundayEvents = events.filter(e => e.eventType === 'sunday')
  const specialEvents = events.filter(e => e.eventType === 'special')
  const totalAssignments = events.reduce((sum, e) => sum + (e.assignments?.length || 0), 0)
  const totalMembers = new Set(events.flatMap(e => e.assignments?.filter(a => a.member).map(a => a.member!.id) || [])).size

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Church Setup Roster</Text>
          <Text style={styles.subtitle}>
            {month} {year} - Events & Member Assignments
          </Text>
        </View>

        {/* Sunday Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sunday Services ({sundayEvents.length})
          </Text>
          {sundayEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventLeft}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                </Text>
                <Text style={styles.eventType}>Sunday Service</Text>
              </View>
              <View style={styles.eventRight}>
                <Text style={styles.assignmentsTitle}>Assigned Members:</Text>
                {event.assignments && event.assignments.length > 0 ? (
                  event.assignments.map((assignment) => (
                    <Text key={assignment.id} style={styles.memberName}>
                      • {assignment.member.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.noAssignments}>No assignments</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Special Events */}
        {specialEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Special Events ({specialEvents.length})
            </Text>
            {specialEvents.map((event) => (
              <View key={event.id} style={styles.specialEventItem}>
                <View style={styles.eventLeft}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                  </Text>
                  <Text style={styles.eventType}>Special Event</Text>
                </View>
                <View style={styles.eventRight}>
                  <Text style={styles.assignmentsTitle}>Assigned Members:</Text>
                  {event.assignments && event.assignments.length > 0 ? (
                    event.assignments.map((assignment) => (
                      <Text key={assignment.id} style={styles.memberName}>
                        • {assignment.member.name}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.noAssignments}>No assignments</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Events:</Text>
            <Text style={styles.summaryValue}>{events.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sunday Services:</Text>
            <Text style={styles.summaryValue}>{sundayEvents.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Special Events:</Text>
            <Text style={styles.summaryValue}>{specialEvents.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Assignments:</Text>
            <Text style={styles.summaryValue}>{totalAssignments}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Unique Members Assigned:</Text>
            <Text style={styles.summaryValue}>{totalMembers}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export const exportEventsToPDF = async (
  events: EventWithAssignments[],
  month?: string,
  year?: number
) => {
  const currentDate = new Date()
  const exportMonth = month || currentDate.toLocaleDateString('en-US', { month: 'long' })
  const exportYear = year || currentDate.getFullYear()

  const doc = <PDFDocument events={events} month={exportMonth} year={exportYear} />
  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `church-roster-${exportMonth.toLowerCase()}-${exportYear}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportCurrentMonthEvents = async (events: EventWithAssignments[]) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })

  const monthName = now.toLocaleDateString('en-US', { month: 'long' })
  
  await exportEventsToPDF(currentMonthEvents, monthName, currentYear)
}