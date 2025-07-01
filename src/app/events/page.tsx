'use client'

import { useEffect, useState } from 'react'
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
import { eventsApi, type Event, type Member } from '@/lib/supabase'
import { formatDate, getNextSundays } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, RefreshCw, Zap } from 'lucide-react'

type EventWithAssignments = Event & { assignments: Array<{ id: string; member: Member }> }

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithAssignments[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSpecial, setShowAddSpecial] = useState(false)
  const [showGenerateSundays, setShowGenerateSundays] = useState(false)
  
  // Add Special Event Form
  const [specialEventForm, setSpecialEventForm] = useState({
    title: '',
    date: undefined as Date | undefined
  })

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getWithAssignments()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
      alert('Failed to load events. Please check your connection.')
    } finally {
      setLoading(false)
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

  useEffect(() => {
    loadEvents()
  }, [])

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
        {/* Sunday Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              Sunday Services ({sundayEvents.length})
            </CardTitle>
            <CardDescription>
              Regular weekly Sunday services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sundayEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No Sunday services found</p>
                <Button variant="outline" onClick={() => setShowGenerateSundays(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Sunday Services
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {sundayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}