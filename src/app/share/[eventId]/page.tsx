'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DutyCard } from '@/components/duty-card'
import { eventsApi, type Event, type Member } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Calendar, ArrowLeft, Share2, Users } from 'lucide-react'
import Link from 'next/link'

type EventWithAssignments = Event & { assignments: Array<{ id: string; member: Member }> }

export default function ShareEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<EventWithAssignments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvent = async () => {
    try {
      const events = await eventsApi.getWithAssignments()
      const foundEvent = events.find(e => e.id === params.eventId)
      
      if (foundEvent) {
        setEvent(foundEvent)
      } else {
        setError('Event not found')
      }
    } catch (error) {
      console.error('Error loading event:', error)
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const shareEvent = () => {
    if (!event) return

    const assignedMembers = event.assignments?.map(a => a.member) || []
    const members = assignedMembers.length > 0 
      ? assignedMembers.map(m => m.name).join(', ')
      : 'No assignments yet'
    
    const message = `🏛️ ${event.title}
📅 ${formatDate(event.event_date)}
👥 ${members}

View full roster: ${window.location.origin}`
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: message,
        url: window.location.href
      })
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch (error) {
      alert('Failed to copy link')
    }
  }

  useEffect(() => {
    loadEvent()
  }, [params.eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
                <p className="text-gray-600 mb-4">
                  {error || 'The event you\'re looking for doesn\'t exist or has been removed.'}
                </p>
                <Link href="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600">Shared event information</p>
          </div>
        </div>

        {/* Event Card */}
        <div className="mb-8">
          <DutyCard event={event} isNext={true} />
        </div>

        {/* Share Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share This Event
            </CardTitle>
            <CardDescription>
              Share this event with others to let them know who's on duty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                onClick={shareEvent}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button variant="outline" onClick={copyLink}>
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Summary for WhatsApp Preview */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-900">Quick Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{event.title} - {formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>
                {event.assignments?.length > 0 
                  ? `${event.assignments.length} member(s) assigned: ${event.assignments.map(a => a.member.name).join(', ')}`
                  : 'No members assigned yet'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${
                  event.event_type === 'sunday' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}
              >
                {event.event_type === 'sunday' ? 'Sunday Service' : 'Special Event'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}