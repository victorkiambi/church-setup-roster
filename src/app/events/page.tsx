'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AssignMembers } from '@/components/assign-members'
import { DeleteConfirmation } from '@/components/delete-confirmation'
import { eventsApi, supabase, type Event, type Member } from '@/lib/supabase'
import { formatDate, getNextSundays } from '@/lib/utils'
import { autoArchivePastEvents } from '@/lib/auto-archive'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, RefreshCw, Zap, Archive, Trash2, Eye } from 'lucide-react'

type EventWithAssignments = Event & { assignments: Array<{ id: string; member: Member }> }

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithAssignments[]>([])
  const [archivedEvents, setArchivedEvents] = useState<EventWithAssignments[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSpecial, setShowAddSpecial] = useState(false)
  const [showGenerateSundays, setShowGenerateSundays] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  
  // Add Special Event Form
  const [specialEventForm, setSpecialEventForm] = useState({
    title: '',
    date: undefined as Date | undefined
  })

  const loadEvents = useCallback(async () => {
    try {
      // Auto-archive past events first
      await autoArchivePastEvents()
      
      // Load active and archived events
      const [activeData, archivedData] = await Promise.all([
        eventsApi.getWithAssignments(),
        loadArchivedEvents()
      ])
      
      setEvents(activeData)
      setArchivedEvents(archivedData)
    } catch (error) {
      console.error('Error loading events:', error)
      alert('Failed to load events. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadArchivedEvents = async () => {
    try {
      const archived = await eventsApi.getArchived()
      // Get assignments for archived events
      const archivedWithAssignments = await Promise.all(
        archived.map(async (event) => {
          const { data } = await supabase
            .from('events')
            .select(`
              *,
              assignments (
                id,
                member:members (
                  id,
                  name,
                  phone
                )
              )
            `)
            .eq('id', event.id)
            .single()
          return data
        })
      )
      return archivedWithAssignments.filter(Boolean)
    } catch (error) {
      console.error('Error loading archived events:', error)
      return []
    }
  }

  const generateSundays = async () => {
    setLoading(true)
    try {
      const nextSunday = getNextSundays(1)[0]
      await eventsApi.generateSundays(nextSunday, 8)
      await loadEvents()
      setShowGenerateSundays(false)
      alert('Successfully generated 8 weeks of Sunday services!')
    } catch (error) {
      console.error('Error generating Sundays:', error)
      alert('Failed to generate Sunday services. Some dates may already exist.')
    } finally {
      setLoading(false)
    }
  }

  const addSpecialEvent = async () => {
    if (!specialEventForm.title.trim() || !specialEventForm.date) return

    try {
      await eventsApi.create({
        title: specialEventForm.title.trim(),
        event_date: format(specialEventForm.date, 'yyyy-MM-dd'),
        event_type: 'special'
      })
      
      setSpecialEventForm({ title: '', date: undefined })
      setShowAddSpecial(false)
      await loadEvents()
    } catch (error) {
      console.error('Error adding special event:', error)
      alert('Failed to add special event.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    await eventsApi.delete(eventId)
    await loadEvents()
  }

  const handleArchiveEvent = async (eventId: string) => {
    await eventsApi.archive(eventId)
    await loadEvents()
  }

  const handleUnarchiveEvent = async (eventId: string) => {
    await eventsApi.unarchive(eventId)
    await loadEvents()
  }

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  // Organize Sunday events by current month vs other months
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const currentMonthSundays = events.filter(e => {
    if (e.event_type !== 'sunday') return false
    const eventDate = new Date(e.event_date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })
  
  const otherSundays = events.filter(e => {
    if (e.event_type !== 'sunday') return false
    const eventDate = new Date(e.event_date)
    return !(eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear)
  })
  
  const sundayEvents = events.filter(e => e.event_type === 'sunday')
  const specialEvents = events.filter(e => e.event_type === 'special')
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date())

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events & Assignments</h1>
          <p className="text-muted-foreground">Manage Sunday services and special events</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowArchived(!showArchived)}
            className={showArchived ? 'bg-gray-100' : ''}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Hide' : 'View'} Archived ({archivedEvents.length})
          </Button>
          
          <Dialog open={showGenerateSundays} onOpenChange={setShowGenerateSundays}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Sundays
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Sunday Services</DialogTitle>
                <DialogDescription>
                  This will create 8 weeks of Sunday services starting from the next Sunday.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGenerateSundays(false)}>
                  Cancel
                </Button>
                <Button onClick={generateSundays}>
                  Generate 8 Sundays
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddSpecial} onOpenChange={setShowAddSpecial}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Special Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Special Event</DialogTitle>
                <DialogDescription>
                  Create a special event (e.g., Christmas Prep, Easter Service)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={specialEventForm.title}
                    onChange={(e) => setSpecialEventForm({ ...specialEventForm, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Christmas Prep"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date *</Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !specialEventForm.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {specialEventForm.date ? format(specialEventForm.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={specialEventForm.date}
                          onSelect={(date) => setSpecialEventForm({ ...specialEventForm, date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSpecial(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addSpecialEvent}
                  disabled={!specialEventForm.title.trim() || !specialEventForm.date}
                >
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{sundayEvents.length}</div>
            <p className="text-xs text-muted-foreground">Sunday Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{specialEvents.length}</div>
            <p className="text-xs text-muted-foreground">Special Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e.assignments?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {/* Current Month Sundays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              Current Month Sundays ({currentMonthSundays.length})
            </CardTitle>
            <CardDescription>
              {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Sunday services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthSundays.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No Sunday services for this month</p>
                <Button variant="outline" onClick={() => setShowGenerateSundays(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Sunday Services
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {currentMonthSundays.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                      <Badge variant="default">Sunday</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.assignments && event.assignments.length > 0 ? (
                        <div className="text-sm text-muted-foreground mr-2">
                          {event.assignments.map((a) => a.member.name).join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mr-2">
                          No assignments
                        </div>
                      )}
                      <AssignMembers event={event} onAssignmentsChanged={loadEvents} />
                      
                      <DeleteConfirmation
                        variant="archive"
                        title="Archive Event"
                        description={`Archive "${event.title}"? It will be moved to archived events.`}
                        onConfirm={() => handleArchiveEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                      
                      <DeleteConfirmation
                        variant="delete"
                        title="Delete Event"
                        description={`Permanently delete "${event.title}"? This cannot be undone.`}
                        onConfirm={() => handleDeleteEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Sundays */}
        {otherSundays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                Other Sundays ({otherSundays.length})
              </CardTitle>
              <CardDescription>
                Sunday services from other months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {otherSundays.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                      <Badge variant="outline">Sunday</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.assignments && event.assignments.length > 0 ? (
                        <div className="text-sm text-muted-foreground mr-2">
                          {event.assignments.map((a) => a.member.name).join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mr-2">
                          No assignments
                        </div>
                      )}
                      <AssignMembers event={event} onAssignmentsChanged={loadEvents} />
                      
                      <DeleteConfirmation
                        variant="archive"
                        title="Archive Event"
                        description={`Archive "${event.title}"? It will be moved to archived events.`}
                        onConfirm={() => handleArchiveEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                      
                      <DeleteConfirmation
                        variant="delete"
                        title="Delete Event"
                        description={`Permanently delete "${event.title}"? This cannot be undone.`}
                        onConfirm={() => handleDeleteEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Special Events ({specialEvents.length})
            </CardTitle>
            <CardDescription>
              Special services and events (Fridays, Saturdays, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specialEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No special events found</p>
                <Button onClick={() => setShowAddSpecial(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Special Event
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {specialEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                      <Badge variant="secondary">Special</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.assignments && event.assignments.length > 0 ? (
                        <div className="text-sm text-muted-foreground mr-2">
                          {event.assignments.map((a) => a.member.name).join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mr-2">
                          No assignments
                        </div>
                      )}
                      <AssignMembers event={event} onAssignmentsChanged={loadEvents} />
                      
                      <DeleteConfirmation
                        variant="archive"
                        title="Archive Event"
                        description={`Archive "${event.title}"? It will be moved to archived events.`}
                        onConfirm={() => handleArchiveEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                      
                      <DeleteConfirmation
                        variant="delete"
                        title="Delete Event"
                        description={`Permanently delete "${event.title}"? This cannot be undone.`}
                        onConfirm={() => handleDeleteEvent(event.id)}
                      >
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archived Events */}
        {showArchived && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-gray-500" />
                Archived Events ({archivedEvents.length})
              </CardTitle>
              <CardDescription>
                Past events that have been automatically archived
              </CardDescription>
            </CardHeader>
            <CardContent>
              {archivedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No archived events</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {archivedEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-gray-700">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.event_date)}
                          </p>
                        </div>
                        <Badge variant={event.event_type === 'sunday' ? 'default' : 'secondary'} className="opacity-75">
                          {event.event_type === 'sunday' ? 'Sunday' : 'Special'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.assignments && event.assignments.length > 0 ? (
                          <div className="text-sm text-muted-foreground mr-2">
                            {event.assignments.map((a) => a.member.name).join(', ')}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground mr-2">
                            No assignments
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUnarchiveEvent(event.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        
                        <DeleteConfirmation
                          variant="delete"
                          title="Delete Archived Event"
                          description={`Permanently delete "${event.title}"? This cannot be undone.`}
                          onConfirm={() => handleDeleteEvent(event.id)}
                        >
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteConfirmation>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}