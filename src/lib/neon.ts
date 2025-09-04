import { db, teams, members, events, assignments, type Team, type Member, type Event, type Assignment, type NewTeam, type NewMember, type NewEvent, type NewAssignment } from './db'
import { eq, and, gte, lt, desc, asc } from 'drizzle-orm'

// Database operations for Teams
export const teamsApi = {
  // Get all active teams
  async getAll() {
    return await db.select().from(teams).where(eq(teams.isActive, true)).orderBy(asc(teams.name))
  },

  // Get team by ID
  async getById(id: string) {
    const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1)
    if (result.length === 0) throw new Error('Team not found')
    return result[0]
  },

  // Create team
  async create(team: Omit<NewTeam, 'id' | 'createdAt'>) {
    const result = await db.insert(teams).values(team).returning()
    return result[0]
  },

  // Update team
  async update(id: string, updates: Partial<Team>) {
    const result = await db.update(teams).set(updates).where(eq(teams.id, id)).returning()
    if (result.length === 0) throw new Error('Team not found')
    return result[0]
  },

  // Toggle active status
  async toggleActive(id: string, isActive: boolean) {
    const result = await db.update(teams).set({ isActive }).where(eq(teams.id, id)).returning()
    if (result.length === 0) throw new Error('Team not found')
    return result[0]
  }
}

// Database operations for Members
export const membersApi = {
  // Get all members for a team
  async getAll(teamId: string) {
    return await db.query.members.findMany({
      where: eq(members.teamId, teamId),
      with: { team: true },
      orderBy: asc(members.name)
    })
  },

  // Get active members for a team
  async getActive(teamId: string) {
    return await db.query.members.findMany({
      where: and(eq(members.teamId, teamId), eq(members.isActive, true)),
      with: { team: true },
      orderBy: asc(members.name)
    })
  },

  // Add new member
  async create(member: Omit<NewMember, 'id' | 'createdAt'>) {
    const result = await db.insert(members).values(member).returning()
    const newMember = await db.query.members.findFirst({
      where: eq(members.id, result[0].id),
      with: { team: true }
    })
    if (!newMember) throw new Error('Failed to create member')
    return newMember
  },

  // Update member
  async update(id: string, updates: Partial<Member>) {
    const result = await db.update(members).set(updates).where(eq(members.id, id)).returning()
    if (result.length === 0) throw new Error('Member not found')
    
    const updatedMember = await db.query.members.findFirst({
      where: eq(members.id, id),
      with: { team: true }
    })
    if (!updatedMember) throw new Error('Member not found')
    return updatedMember
  },

  // Toggle active status
  async toggleActive(id: string, isActive: boolean) {
    const result = await db.update(members).set({ isActive }).where(eq(members.id, id)).returning()
    if (result.length === 0) throw new Error('Member not found')
    
    const updatedMember = await db.query.members.findFirst({
      where: eq(members.id, id),
      with: { team: true }
    })
    if (!updatedMember) throw new Error('Member not found')
    return updatedMember
  },

  // Delete member (soft delete by setting inactive)
  async delete(id: string) {
    return await this.toggleActive(id, false)
  }
}

// Database operations for Events
export const eventsApi = {
  // Get all events for a team (non-archived)
  async getAll(teamId: string) {
    return await db.query.events.findMany({
      where: and(eq(events.teamId, teamId), eq(events.isArchived, false)),
      with: { team: true },
      orderBy: asc(events.eventDate)
    })
  },

  // Get all events for a team including archived
  async getAllIncludingArchived(teamId: string) {
    return await db.query.events.findMany({
      where: eq(events.teamId, teamId),
      with: { team: true },
      orderBy: asc(events.eventDate)
    })
  },

  // Get archived events for a team
  async getArchived(teamId: string) {
    return await db.query.events.findMany({
      where: and(eq(events.teamId, teamId), eq(events.isArchived, true)),
      with: { team: true },
      orderBy: desc(events.eventDate)
    })
  },

  // Get upcoming events for a team (non-archived)
  async getUpcoming(teamId: string) {
    const today = new Date().toISOString().split('T')[0]
    return await db.query.events.findMany({
      where: and(
        eq(events.teamId, teamId),
        eq(events.isArchived, false),
        gte(events.eventDate, today)
      ),
      with: { team: true },
      orderBy: asc(events.eventDate)
    })
  },

  // Get events with assignments for a team (non-archived)
  async getWithAssignments(teamId: string) {
    return await db.query.events.findMany({
      where: and(eq(events.teamId, teamId), eq(events.isArchived, false)),
      with: {
        team: true,
        assignments: {
          with: {
            member: true
          }
        }
      },
      orderBy: asc(events.eventDate)
    })
  },

  // Create event
  async create(event: Omit<NewEvent, 'id' | 'createdAt'>) {
    const result = await db.insert(events).values(event).returning()
    const newEvent = await db.query.events.findFirst({
      where: eq(events.id, result[0].id),
      with: { team: true }
    })
    if (!newEvent) throw new Error('Failed to create event')
    return newEvent
  },

  // Generate Sunday services for a team
  async generateSundays(startDate: Date, teamId: string, count: number = 8) {
    const sundays = []
    const current = new Date(startDate)
    
    for (let i = 0; i < count; i++) {
      sundays.push({
        title: 'Sunday Service',
        eventDate: current.toISOString().split('T')[0],
        eventType: 'sunday' as const,
        teamId
      })
      current.setDate(current.getDate() + 7)
    }

    const result = await db.insert(events).values(sundays).returning()
    return await Promise.all(
      result.map(event => 
        db.query.events.findFirst({
          where: eq(events.id, event.id),
          with: { team: true }
        })
      )
    ).then(results => results.filter(Boolean))
  },

  // Generate missing Sundays for current month for a team
  async generateMissingSundaysForMonth(teamId: string, year?: number, month?: number) {
    const { getAllSundaysInMonth, formatDateString } = await import('./utils')
    
    const allSundays = getAllSundaysInMonth(year, month)
    const startOfMonth = new Date(year || new Date().getFullYear(), month !== undefined ? month : new Date().getMonth(), 1)
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)
    
    const existingEvents = await db.select({ eventDate: events.eventDate })
      .from(events)
      .where(and(
        eq(events.teamId, teamId),
        eq(events.eventType, 'sunday'),
        gte(events.eventDate, formatDateString(startOfMonth)),
        lt(events.eventDate, formatDateString(new Date(endOfMonth.getTime() + 24 * 60 * 60 * 1000)))
      ))
    
    const existingDates = new Set(existingEvents.map(e => e.eventDate))
    
    const missingSundays = allSundays
      .filter(sunday => {
        const dateStr = formatDateString(sunday)
        return !existingDates.has(dateStr)
      })
      .map(sunday => ({
        title: 'Sunday Service',
        eventDate: formatDateString(sunday),
        eventType: 'sunday' as const,
        teamId
      }))
    
    if (missingSundays.length === 0) {
      return []
    }
    
    const result = await db.insert(events).values(missingSundays).returning()
    return await Promise.all(
      result.map(event => 
        db.query.events.findFirst({
          where: eq(events.id, event.id),
          with: { team: true }
        })
      )
    ).then(results => results.filter(Boolean))
  },

  // Update event
  async update(id: string, updates: Partial<Event>) {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning()
    if (result.length === 0) throw new Error('Event not found')
    
    const updatedEvent = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: { team: true }
    })
    if (!updatedEvent) throw new Error('Event not found')
    return updatedEvent
  },

  // Archive event
  async archive(id: string) {
    return await this.update(id, { isArchived: true })
  },

  // Unarchive event
  async unarchive(id: string) {
    return await this.update(id, { isArchived: false })
  },

  // Auto-archive past events for a team
  async autoArchivePastEvents(teamId: string) {
    const today = new Date().toISOString().split('T')[0]
    const result = await db.update(events)
      .set({ isArchived: true })
      .where(and(
        eq(events.teamId, teamId),
        lt(events.eventDate, today),
        eq(events.isArchived, false)
      ))
      .returning()
    
    return await Promise.all(
      result.map(event => 
        db.query.events.findFirst({
          where: eq(events.id, event.id),
          with: { team: true }
        })
      )
    ).then(results => results.filter(Boolean))
  },

  // Delete event (permanent)
  async delete(id: string) {
    await db.delete(events).where(eq(events.id, id))
  }
}

// Database operations for Assignments
export const assignmentsApi = {
  // Get assignments for an event
  async getByEvent(eventId: string) {
    return await db.query.assignments.findMany({
      where: eq(assignments.eventId, eventId),
      with: { member: true }
    })
  },

  // Create assignment
  async create(assignment: Omit<NewAssignment, 'id' | 'createdAt'>) {
    const result = await db.insert(assignments).values(assignment).returning()
    return result[0]
  },

  // Create multiple assignments
  async createMultiple(assignmentList: Array<Omit<NewAssignment, 'id' | 'createdAt'>>) {
    const result = await db.insert(assignments).values(assignmentList).returning()
    return result
  },

  // Remove assignment
  async delete(id: string) {
    await db.delete(assignments).where(eq(assignments.id, id))
  },

  // Remove all assignments for an event
  async deleteByEvent(eventId: string) {
    await db.delete(assignments).where(eq(assignments.eventId, eventId))
  }
}

// Re-export types for compatibility
export type { Team, Member, Event, Assignment }