import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations for Members
export const membersApi = {
  // Get all members
  async getAll() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Member[]
  },

  // Get active members only
  async getActive() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data as Member[]
  },

  // Add new member
  async create(member: { name: string; phone: string }) {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single()
    
    if (error) throw error
    return data as Member
  },

  // Update member
  async update(id: string, updates: Partial<Member>) {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Member
  },

  // Toggle active status
  async toggleActive(id: string, is_active: boolean) {
    const { data, error } = await supabase
      .from('members')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Member
  },

  // Delete member (soft delete by setting inactive)
  async delete(id: string) {
    const { data, error } = await supabase
      .from('members')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Member
  }
}

// Database operations for Events
export const eventsApi = {
  // Get all events (non-archived)
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_archived', false)
      .order('event_date')
    
    if (error) throw error
    return data as Event[]
  },

  // Get all events including archived
  async getAllIncludingArchived() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date')
    
    if (error) throw error
    return data as Event[]
  },

  // Get archived events
  async getArchived() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_archived', true)
      .order('event_date', { ascending: false })
    
    if (error) throw error
    return data as Event[]
  },

  // Get upcoming events (non-archived)
  async getUpcoming() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_archived', false)
      .gte('event_date', today)
      .order('event_date')
    
    if (error) throw error
    return data as Event[]
  },

  // Get events with assignments (non-archived)
  async getWithAssignments() {
    const { data, error } = await supabase
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
      .eq('is_archived', false)
      .order('event_date')
    
    if (error) throw error
    return data as (Event & { assignments: Array<{ id: string; member: Member }> })[]
  },

  // Create event
  async create(event: { title: string; event_date: string; event_type: 'sunday' | 'special' }) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single()
    
    if (error) throw error
    return data as Event
  },

  // Generate Sunday services
  async generateSundays(startDate: Date, count: number = 8) {
    const sundays = []
    const current = new Date(startDate)
    
    for (let i = 0; i < count; i++) {
      sundays.push({
        title: 'Sunday Service',
        event_date: current.toISOString().split('T')[0],
        event_type: 'sunday' as const
      })
      current.setDate(current.getDate() + 7)
    }

    const { data, error } = await supabase
      .from('events')
      .insert(sundays)
      .select()
    
    if (error) throw error
    return data as Event[]
  },

  // Generate missing Sundays for current month (safe - won't affect existing events)
  async generateMissingSundaysForMonth(year?: number, month?: number) {
    const { getAllSundaysInMonth, formatDateString } = await import('./utils')
    
    // Get all Sundays for the specified month (defaults to current month)
    const allSundays = getAllSundaysInMonth(year, month)
    
    // Get existing Sunday events for this month
    const startOfMonth = new Date(year || new Date().getFullYear(), month !== undefined ? month : new Date().getMonth(), 1)
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)
    
    const { data: existingEvents } = await supabase
      .from('events')
      .select('event_date')
      .eq('event_type', 'sunday')
      .gte('event_date', formatDateString(startOfMonth))
      .lte('event_date', formatDateString(endOfMonth))
    
    const existingDates = new Set(existingEvents?.map(e => e.event_date) || [])
    
    // Find missing Sundays
    const missingSundays = allSundays
      .filter(sunday => {
        const dateStr = formatDateString(sunday)
        return !existingDates.has(dateStr)
      })
      .map(sunday => ({
        title: 'Sunday Service',
        event_date: formatDateString(sunday),
        event_type: 'sunday' as const
      }))
    
    if (missingSundays.length === 0) {
      return [] // No missing Sundays
    }
    
    // Insert only the missing Sundays
    const { data, error } = await supabase
      .from('events')
      .insert(missingSundays)
      .select()
    
    if (error) throw error
    return data as Event[]
  },

  // Update event
  async update(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Event
  },

  // Archive event
  async archive(id: string) {
    const { data, error } = await supabase
      .from('events')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Event
  },

  // Unarchive event
  async unarchive(id: string) {
    const { data, error } = await supabase
      .from('events')
      .update({ is_archived: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Event
  },

  // Auto-archive past events
  async autoArchivePastEvents() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('events')
      .update({ is_archived: true })
      .lt('event_date', today)
      .eq('is_archived', false)
      .select()
    
    if (error) throw error
    return data as Event[]
  },

  // Delete event (permanent)
  async delete(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Database operations for Assignments
export const assignmentsApi = {
  // Get assignments for an event
  async getByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        member:members (
          id,
          name,
          phone
        )
      `)
      .eq('event_id', eventId)
    
    if (error) throw error
    return data as (Assignment & { member: Member })[]
  },

  // Create assignment
  async create(assignment: { event_id: string; member_id: string }) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single()
    
    if (error) throw error
    return data as Assignment
  },

  // Create multiple assignments
  async createMultiple(assignments: Array<{ event_id: string; member_id: string }>) {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignments)
      .select()
    
    if (error) throw error
    return data as Assignment[]
  },

  // Remove assignment
  async delete(id: string) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Remove all assignments for an event
  async deleteByEvent(eventId: string) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('event_id', eventId)
    
    if (error) throw error
  }
}

// Types for our database
export interface Member {
  id: string
  name: string
  phone: string
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  event_date: string
  event_type: 'sunday' | 'special'
  is_archived: boolean
  created_at: string
}

export interface Assignment {
  id: string
  event_id: string
  member_id: string
  created_at: string
  member?: Member
  event?: Event
}