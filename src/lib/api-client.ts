// Client-side API wrapper for making requests to your API routes
import type { Team, Member, Event, Assignment } from './db/schema'

type EventWithAssignments = Event & { 
  assignments: Array<{ id: string; member: Member }> 
}

// Base API client
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Teams API
  teams = {
    getAll: () => this.request<Team[]>('/api/teams'),
    getById: (id: string) => this.request<Team>(`/api/teams/${id}`),
    create: (team: Omit<Team, 'id' | 'createdAt'>) => 
      this.request<Team>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(team),
      }),
    update: (id: string, updates: Partial<Team>) =>
      this.request<Team>(`/api/teams/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  }

  // Members API
  members = {
    getAll: (teamId: string) => 
      this.request<Member[]>(`/api/members?teamId=${teamId}`),
    getActive: (teamId: string) => 
      this.request<Member[]>(`/api/members?teamId=${teamId}&activeOnly=true`),
    create: (member: Omit<Member, 'id' | 'createdAt'>) =>
      this.request<Member>('/api/members', {
        method: 'POST',
        body: JSON.stringify(member),
      }),
    update: (id: string, updates: Partial<Member>) =>
      this.request<Member>(`/api/members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    toggleActive: (id: string, isActive: boolean) =>
      this.request<Member>(`/api/members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    delete: (id: string) =>
      this.request<void>(`/api/members/${id}`, {
        method: 'DELETE',
      }),
  }

  // Events API
  events = {
    getAll: (teamId: string) => 
      this.request<Event[]>(`/api/events?teamId=${teamId}`),
    getUpcoming: (teamId: string) => 
      this.request<Event[]>(`/api/events?teamId=${teamId}&type=upcoming`),
    getArchived: (teamId: string) => 
      this.request<Event[]>(`/api/events?teamId=${teamId}&type=archived`),
    getWithAssignments: (teamId: string) => 
      this.request<EventWithAssignments[]>(`/api/events?teamId=${teamId}&withAssignments=true`),
    create: (event: Omit<Event, 'id' | 'createdAt'>) =>
      this.request<Event>('/api/events', {
        method: 'POST',
        body: JSON.stringify(event),
      }),
    update: (id: string, updates: Partial<Event>) =>
      this.request<Event>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    generateMissingSundaysForMonth: (teamId: string, year?: number, month?: number) =>
      this.request<Event[]>('/api/events/generate-sundays', {
        method: 'POST',
        body: JSON.stringify({ teamId, year, month }),
      }),
    archive: (id: string) =>
      this.request<Event>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived: true }),
      }),
    unarchive: (id: string) =>
      this.request<Event>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived: false }),
      }),
    delete: (id: string) =>
      this.request<void>(`/api/events/${id}`, {
        method: 'DELETE',
      }),
  }

  // Auto-archive API
  autoArchive = {
    archivePastEvents: (teamId: string) =>
      this.request<Event[]>('/api/auto-archive', {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      }),
  }

  // Assignments API
  assignments = {
    getByEvent: (eventId: string) =>
      this.request<Assignment[]>(`/api/assignments?eventId=${eventId}`),
    create: (assignment: Omit<Assignment, 'id' | 'createdAt'>) =>
      this.request<Assignment>('/api/assignments', {
        method: 'POST',
        body: JSON.stringify(assignment),
      }),
    createMultiple: (assignments: Array<Omit<Assignment, 'id' | 'createdAt'>>) =>
      this.request<Assignment[]>('/api/assignments/bulk', {
        method: 'POST',
        body: JSON.stringify({ assignments }),
      }),
    delete: (id: string) =>
      this.request<void>(`/api/assignments/${id}`, {
        method: 'DELETE',
      }),
    deleteByEvent: (eventId: string) =>
      this.request<void>(`/api/assignments?eventId=${eventId}`, {
        method: 'DELETE',
      }),
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()

// Export individual APIs for convenience
export const { teams: teamsApi, members: membersApi, events: eventsApi, assignments: assignmentsApi, autoArchive } = apiClient