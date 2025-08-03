'use client'

import { useState, useEffect } from 'react'
import { Calendar, Menu, Home, Users, CalendarDays, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { TeamSelector } from '@/components/team-selector'
import { useTeam } from '@/contexts/team-context'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { currentTeam } = useTeam()

  const closeMenu = () => setIsOpen(false)

  // Close menu when pathname or team changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, currentTeam?.id])

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/members', label: 'Members', icon: Users },
    { href: '/events', label: 'Events', icon: CalendarDays },
    { href: '/admin/teams', label: 'Teams', icon: Settings },
  ]

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
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Team Selector - Desktop */}
          <div className="hidden md:block">
            <TeamSelector />
          </div>
          
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet key={currentTeam?.id || 'no-team'} open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Church Roster
                    </span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link 
                        key={item.href}
                        href={item.href} 
                        onClick={closeMenu}
                        className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    )
                  })}
                  
                  {/* Team Selector for Mobile */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-500 mb-3">Team</div>
                      <TeamSelector onTeamChange={closeMenu} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs text-gray-500 text-center">
                    Church Roster Management System
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}