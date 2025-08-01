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

// Helper function to format date as YYYY-MM-DD in local timezone (avoiding UTC conversion)
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getAllSundaysInMonth(year?: number, month?: number): Date[] {
  const sundays: Date[] = []
  const today = new Date()
  const targetYear = year || today.getFullYear()
  const targetMonth = month !== undefined ? month : today.getMonth()
  
  // Get the first day of the month
  const firstDay = new Date(targetYear, targetMonth, 1)
  
  // Find the first Sunday of the month
  const firstSunday = new Date(firstDay)
  const dayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (dayOfWeek === 0) {
    // First day is already a Sunday
    firstSunday.setDate(1)
  } else {
    // Calculate days to add to get to the first Sunday
    const daysToAdd = 7 - dayOfWeek
    firstSunday.setDate(1 + daysToAdd)
  }
  
  // Add all Sundays in the month
  const currentSunday = new Date(firstSunday)
  while (currentSunday.getMonth() === targetMonth) {
    sundays.push(new Date(currentSunday))
    currentSunday.setDate(currentSunday.getDate() + 7)
  }
  
  return sundays
}

export function isUpcoming(date: string | Date): boolean {
  const eventDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate >= today
}