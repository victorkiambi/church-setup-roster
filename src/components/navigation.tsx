'use client'

import { Calendar } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Church Roster
              </h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                Home
              </a>
              <a href="/members" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                Members
              </a>
              <a href="/events" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                Events
              </a>
            </div>
          </div>
          <div className="md:hidden">
            <select 
              onChange={(e) => window.location.href = e.target.value}
              className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="/">Home</option>
              <option value="/members">Members</option>
              <option value="/events">Events</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}