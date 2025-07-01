import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities for the roster app
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getNextSundays(count = 8): Date[] {
  const sundays: Date[] = []
  const today = new Date()
  const currentDay = today.getDay()
  
  // Calculate days until next Sunday (0 = Sunday)
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay
  
  for (let i = 0; i < count; i++) {
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + daysUntilSunday + (i * 7))
    sundays.push(nextSunday)
  }
  
  return sundays
}

export function isUpcoming(date: string | Date): boolean {
  const eventDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate >= today
}