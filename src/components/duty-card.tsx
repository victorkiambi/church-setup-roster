'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssignMembers } from '@/components/assign-members'
import { DeleteConfirmation } from '@/components/delete-confirmation'
import { formatDate, isUpcoming } from '@/lib/utils'
import { eventsApi, type Event, type Member } from '@/lib/neon'
import { useTeam } from '@/contexts/team-context'
import { Calendar, Users, Clock, Share2, Trash2, Archive, FileDown } from 'lucide-react'

interface DutyCardProps {
  event: Event & { assignments: Array<{ id: string; member: Member }> }
  isNext?: boolean
  onAssignmentsChanged?: () => void
  showActions?: boolean
}

export function DutyCard({ event, isNext = false, onAssignmentsChanged, showActions = true }: DutyCardProps) {
  const { currentTeam } = useTeam()
  const assignedMembers = event.assignments?.filter(a => a.member).map(a => a.member!) || []
  const isUpcomingEvent = isUpcoming(event.eventDate)
  
  const handleDelete = async () => {
    await eventsApi.delete(event.id)
    if (onAssignmentsChanged) {
      onAssignmentsChanged()
    }
  }

  const handleArchive = async () => {
    await eventsApi.archive(event.id)
    if (onAssignmentsChanged) {
      onAssignmentsChanged()
    }
  }

  const shareEvent = () => {
    const members = assignedMembers.length > 0 
      ? assignedMembers.map(m => m.name).join(', ')
      : 'No assignments yet'
    
    const shareUrl = `${window.location.origin}/share/${event.id}`
    const teamName = currentTeam?.name || 'Church'
    const message = `🏛️ ${event.title}
📅 ${formatDate(event.eventDate)}
👥 ${members}
🎯 ${teamName} Team

View full details: ${shareUrl}`
    
    if (navigator.share) {
      navigator.share({
        title: `${event.title} - ${teamName}`,
        text: message,
        url: shareUrl
      })
    } else {
      // Fallback: WhatsApp with enhanced message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const exportToPDF = () => {
    const exportUrl = `/api/export-pdf?eventId=${event.id}`
    
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = exportUrl
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_${event.eventDate}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                {formatDate(event.eventDate)}
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
                event.eventType === 'sunday' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              {event.eventType === 'sunday' ? 'Sunday' : 'Special'}
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
                  const eventDate = new Date(event.eventDate)
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
          {showActions && (
            <div className="space-y-3">
              {/* Management Actions */}
              {onAssignmentsChanged && (
                <div className="flex gap-2 justify-end">
                  <DeleteConfirmation
                    variant="archive"
                    title="Archive Event"
                    description={`Are you sure you want to archive "${event.title}"? This will remove it from the main view but keep it for historical records.`}
                    onConfirm={handleArchive}
                  >
                    <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:border-orange-200 h-9">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  </DeleteConfirmation>
                  
                  <DeleteConfirmation
                    variant="delete"
                    title="Delete Event"
                    description={`Are you sure you want to permanently delete "${event.title}"? This action cannot be undone and will also remove all assignments.`}
                    onConfirm={handleDelete}
                  >
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-200 h-9">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DeleteConfirmation>
                </div>
              )}
              
              {/* Primary Actions */}
              <div className="flex gap-3 items-stretch">
                {onAssignmentsChanged && (
                  <AssignMembers event={event} onAssignmentsChanged={onAssignmentsChanged} />
                )}
                <div className="flex gap-2 flex-1">
                  <Button 
                    onClick={exportToPDF}
                    variant="outline"
                    size="default"
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium h-10"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    
                  </Button>
                  <Button 
                    onClick={shareEvent}
                    size="default"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm font-medium h-10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                  
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}