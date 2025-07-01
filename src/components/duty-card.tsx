'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssignMembers } from '@/components/assign-members'
import { formatDate, isUpcoming } from '@/lib/utils'
import { type Event, type Member } from '@/lib/supabase'
import { Calendar, Users, Clock, Share2, UserPlus } from 'lucide-react'

interface DutyCardProps {
  event: Event & { assignments: Array<{ id: string; member: Member }> }
  isNext?: boolean
  onAssignmentsChanged?: () => void
}

export function DutyCard({ event, isNext = false, onAssignmentsChanged }: DutyCardProps) {
  const assignedMembers = event.assignments?.map(a => a.member) || []
  const isUpcomingEvent = isUpcoming(event.event_date)
  
  const shareEvent = () => {
    const members = assignedMembers.length > 0 
      ? assignedMembers.map(m => m.name).join(', ')
      : 'No assignments yet'
    
    const shareUrl = `${window.location.origin}/share/${event.id}`
    const message = `🏛️ ${event.title}
📅 ${formatDate(event.event_date)}
👥 ${members}

View full details: ${shareUrl}`
    
    if (navigator.share) {
      navigator.share({
        title: `${event.title} - Church Setup`,
        text: message,
        url: shareUrl
      })
    } else {
      // Fallback: WhatsApp with enhanced message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <Card className={`
      ${isNext ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-100' : 'shadow-sm hover:shadow-md'} 
      ${!isUpcomingEvent ? 'opacity-75' : ''} 
      transition-all duration-200 border-0
    `}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isNext ? 'bg-blue-500' : 'bg-gray-100'}`}>
              <Calendar className={`h-5 w-5 ${isNext ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div>
              <CardTitle className={`${isNext ? 'text-xl text-blue-900' : 'text-lg text-gray-900'} font-bold`}>
                {event.title}
              </CardTitle>
              <p className={`font-medium ${isNext ? 'text-blue-700' : 'text-gray-600'} ${isNext ? 'text-base' : 'text-sm'}`}>
                {formatDate(event.event_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isNext && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1">
                Next Up
              </Badge>
            )}
            <Badge 
              className={`px-3 py-1 font-medium ${
                event.event_type === 'sunday' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              {event.event_type === 'sunday' ? 'Sunday' : 'Special'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Assigned Members */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                On Duty ({assignedMembers.length})
              </span>
            </div>
            
            {assignedMembers.length > 0 ? (
              <div className="space-y-3">
                {assignedMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className={`font-semibold text-gray-900 ${isNext ? 'text-lg' : 'text-base'}`}>
                      {member.name}
                    </span>
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        {member.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No members assigned yet</p>
              </div>
            )}
          </div>

          {/* Time Until Event (for upcoming events) */}
          {isUpcomingEvent && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">
                {(() => {
                  const eventDate = new Date(event.event_date)
                  const today = new Date()
                  const diffTime = eventDate.getTime() - today.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  if (diffDays === 0) return 'Today'
                  if (diffDays === 1) return 'Tomorrow'
                  if (diffDays < 7) return `In ${diffDays} days`
                  return `In ${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? 's' : ''}`
                })()}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onAssignmentsChanged && (
              <AssignMembers event={event} onAssignmentsChanged={onAssignmentsChanged} />
            )}
            <Button 
              onClick={shareEvent}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm font-medium py-3"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}