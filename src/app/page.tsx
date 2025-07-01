'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DutyCard } from '@/components/duty-card'
import { AddMember } from '@/components/add-member'
import { DutyCardSkeleton, StatsCardSkeleton, MemberCardSkeleton } from '@/components/loading-skeleton'
import { eventsApi, membersApi, type Event, type Member } from '@/lib/supabase'
import { isUpcoming } from '@/lib/utils'
import { autoArchivePastEvents } from '@/lib/auto-archive'
import { Calendar, Users, Zap, ArrowRight, RefreshCw, Share2 } from 'lucide-react'
import Link from 'next/link'

type EventWithAssignments = Event & { assignments: Array<{ id: string; member: Member }> }

export default function Home() {
  const [events, setEvents] = useState<EventWithAssignments[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventsApi.getWithAssignments()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }, [])

  const loadMembers = useCallback(async () => {
    try {
      const data = await membersApi.getAll()
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    // Auto-archive past events before loading
    await autoArchivePastEvents()
    await Promise.all([loadEvents(), loadMembers()])
    setLoading(false)
  }, [loadEvents, loadMembers])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Who&apos;s On Duty?
              </h1>
            </div>
            <p className="text-gray-600 text-xl font-medium">
              Church Setup Roster
            </p>
          </div>

          {/* Loading Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Loading Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <DutyCardSkeleton />
                  {i === 2 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <MemberCardSkeleton key={j} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter and sort events
  const upcomingEvents = events
    .filter(e => isUpcoming(e.event_date))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  const nextSundays = upcomingEvents
    .filter(e => e.event_type === 'sunday')
    .slice(0, 3)

  const specialEvents = upcomingEvents
    .filter(e => e.event_type === 'special')
    .slice(0, 3)

  const nextEvent = upcomingEvents[0]

  // Member stats
  const activeMembers = members.filter(m => m.is_active)
  const recentMembers = members.slice(-3)

  // Get today's events
  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => e.event_date === today)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Who&apos;s On Duty?
            </h1>
          </div>
          <p className="text-gray-600 text-xl font-medium">
            Church Setup Roster
          </p>
        </div>

        {/* Today's Events Alert */}
        {todayEvents.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                Today&apos;s Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{event.title}</span>
                      <Badge 
                        className="px-3 py-1 text-xs font-medium"
                        variant={event.event_type === 'sunday' ? 'default' : 'secondary'}
                      >
                        {event.event_type === 'sunday' ? 'Sunday' : 'Special'}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {event.assignments?.length > 0 
                        ? event.assignments.map(a => a.member.name).join(', ')
                        : 'No assignments'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Event Highlight */}
        {nextEvent && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Up
            </h2>
            <DutyCard event={nextEvent} isNext={true} onAssignmentsChanged={loadData} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {upcomingEvents.length}
                  </div>
                  <p className="text-xs font-medium text-blue-600">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {upcomingEvents.filter(e => (e.assignments?.length || 0) > 0).length}
                  </div>
                  <p className="text-xs font-medium text-green-600">With Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <div className="h-3 w-3 bg-white rounded-full" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {nextSundays.length}
                  </div>
                  <p className="text-xs font-medium text-purple-600">Next Sundays</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {specialEvents.length}
                  </div>
                  <p className="text-xs font-medium text-orange-600">Special Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sunday Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                Next Sundays
              </h2>
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {nextSundays.length > 0 ? (
              <div className="space-y-4">
                {nextSundays.map((event, index) => (
                  <DutyCard 
                    key={event.id} 
                    event={event} 
                    isNext={index === 0 && event.id === nextEvent?.id}
                    onAssignmentsChanged={loadData}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No upcoming Sunday services</p>
                    <Link href="/events">
                      <Button>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Sundays
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Special Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Special Events
              </h2>
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {specialEvents.length > 0 ? (
              <div className="space-y-4">
                {specialEvents.map((event) => (
                  <DutyCard key={event.id} event={event} onAssignmentsChanged={loadData} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No special events scheduled</p>
                    <Link href="/events">
                      <Button variant="outline">
                        Add Special Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Members Quick View */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Team Members
              </h2>
              <Link href="/members">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Add Member */}
            <Card className="mb-4 border-0 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-gray-900">Add New Member</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Quickly add a new team member
                  </p>
                  <AddMember onMemberAdded={loadMembers} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Members */}
            {activeMembers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Members ({activeMembers.length})</CardTitle>
                  <CardDescription>
                    Recent team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <span className="font-semibold text-gray-900">{member.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`px-2 py-0.5 text-xs ${
                                member.is_active 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            Call
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  {activeMembers.length > 3 && (
                    <div className="text-center mt-4">
                      <Link href="/members">
                        <Button variant="outline" size="sm">
                          View All {activeMembers.length} Members
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No members yet</p>
                    <AddMember onMemberAdded={loadMembers} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/members">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Manage Members</h3>
                    <p className="text-sm text-muted-foreground">Add or edit church members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/events">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-medium">Manage Events</h3>
                    <p className="text-sm text-muted-foreground">Create events and assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-medium">Refresh Data</h3>
                  <p className="text-sm text-muted-foreground">Update the roster display</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Homepage */}
        <div className="mt-8 text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-gray-900">Share This Roster</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share the church setup roster with your team
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    const message = `🏛️ Church Setup Roster
                    
See who's on duty this Sunday and upcoming events!

${window.location.origin}`
                    
                    if (navigator.share) {
                      navigator.share({
                        title: 'Church Setup Roster',
                        text: message,
                        url: window.location.origin
                      })
                    } else {
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                      window.open(whatsappUrl, '_blank')
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Roster
                </Button>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.origin)
                      alert('Link copied to clipboard!')
                    } catch {
                      alert('Failed to copy link')
                    }
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Church Setup Roster - 
            {upcomingEvents.length} upcoming events, 
            {events.reduce((sum, e) => sum + (e.assignments?.length || 0), 0)} total assignments
          </p>
        </div>
      </div>
    </div>
  )
}