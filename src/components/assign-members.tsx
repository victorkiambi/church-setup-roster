'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { membersApi, assignmentsApi, type Member, type Event } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Users, X } from 'lucide-react'

interface AssignMembersProps {
  event: Event & { assignments?: Array<{ id: string; member: Member }> }
  onAssignmentsChanged: () => void
}

export function AssignMembers({ event, onAssignmentsChanged }: AssignMembersProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [assignments, setAssignments] = useState<Array<{ id: string; member: Member }>>([])

  const loadMembers = useCallback(async () => {
    try {
      const data = await membersApi.getActive()
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }, [])

  const loadAssignments = useCallback(async () => {
    try {
      const data = await assignmentsApi.getByEvent(event.id)
      setAssignments(data)
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }, [event.id])

  const addAssignment = async () => {
    if (!selectedMember) return

    setLoading(true)
    try {
      await assignmentsApi.create({
        event_id: event.id,
        member_id: selectedMember
      })
      
      setSelectedMember('')
      await loadAssignments()
      onAssignmentsChanged()
    } catch (error) {
      console.error('Error adding assignment:', error)
      alert('Failed to assign member. They may already be assigned to this event.')
    } finally {
      setLoading(false)
    }
  }

  const removeAssignment = async (assignmentId: string) => {
    try {
      await assignmentsApi.delete(assignmentId)
      await loadAssignments()
      onAssignmentsChanged()
    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Failed to remove assignment.')
    }
  }

  useEffect(() => {
    if (open) {
      loadMembers()
      loadAssignments()
    }
  }, [open, loadMembers, loadAssignments])

  const assignedMemberIds = assignments.map(a => a.member.id)
  const availableMembers = members.filter(m => !assignedMemberIds.includes(m.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Assign ({assignments.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Members</DialogTitle>
          <DialogDescription>
            Assign church members to {event.title} on {formatDate(event.event_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignments */}
          <div>
            <h4 className="text-sm font-medium mb-2">Currently Assigned ({assignments.length})</h4>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members assigned yet</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{assignment.member.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssignment(assignment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignment */}
          <div>
            <h4 className="text-sm font-medium mb-2">Add Member</h4>
            <div className="flex gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available members
                    </SelectItem>
                  ) : (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={addAssignment}
                disabled={!selectedMember || loading}
              >
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>

          {/* Event Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant={event.event_type === 'sunday' ? 'default' : 'secondary'}>
                {event.event_type === 'sunday' ? 'Sunday Service' : 'Special Event'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(event.event_date)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}