import { eventsApi } from './supabase'

/**
 * Auto-archive past events
 * This function should be called on app initialization to clean up old events
 */
export async function autoArchivePastEvents(): Promise<number> {
  try {
    const archivedEvents = await eventsApi.autoArchivePastEvents()
    console.log(`Auto-archived ${archivedEvents.length} past events`)
    return archivedEvents.length
  } catch (error) {
    console.error('Error auto-archiving past events:', error)
    return 0
  }
}

/**
 * Check if an event should be auto-archived
 * Events are archived automatically the day after they occur
 */
export function shouldAutoArchive(eventDate: string): boolean {
  const event = new Date(eventDate)
  const today = new Date()
  
  // Set both dates to start of day for accurate comparison
  event.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  // Archive if event date is before today
  return event < today
}

/**
 * Get days until event
 */
export function getDaysUntilEvent(eventDate: string): number {
  const event = new Date(eventDate)
  const today = new Date()
  
  // Set both dates to start of day
  event.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = event.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if event is happening today
 */
export function isEventToday(eventDate: string): boolean {
  return getDaysUntilEvent(eventDate) === 0
}

/**
 * Check if event is happening tomorrow
 */
export function isEventTomorrow(eventDate: string): boolean {
  return getDaysUntilEvent(eventDate) === 1
}