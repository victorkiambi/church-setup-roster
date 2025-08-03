'use client'

import { useState } from 'react'
import { useTeam } from '@/contexts/team-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Users, Loader2 } from 'lucide-react'

interface TeamSelectorProps {
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
}

export function TeamSelector({ showLabel = true, size = 'default' }: TeamSelectorProps) {
  const { currentTeam, teams, isLoading, switchTeam } = useTeam()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <Button variant="outline" size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading teams...
      </Button>
    )
  }

  if (!currentTeam || teams.length === 0) {
    return (
      <Button variant="outline" size={size} disabled>
        <Users className="h-4 w-4 mr-2" />
        No teams available
      </Button>
    )
  }

  const handleTeamSwitch = (teamId: string) => {
    switchTeam(teamId)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={size}
          className="gap-2 font-medium"
          style={{ borderColor: currentTeam.color }}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentTeam.color }}
          />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentTeam.name}
            </span>
          )}
          <span className="sm:hidden">
            {currentTeam.name.split(' ')[0]}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Switch Team
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSwitch(team.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: team.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{team.name}</span>
                {team.id === currentTeam.id && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Active
                  </Badge>
                )}
              </div>
              {team.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {team.description}
                </p>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {teams.length <= 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground text-xs">
              Only one team available
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified version for mobile/compact spaces
export function TeamSelectorCompact() {
  return <TeamSelector showLabel={false} size="sm" />
}

// Team indicator (read-only, just shows current team)
export function TeamIndicator() {
  const { currentTeam, isLoading } = useTeam()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!currentTeam) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: currentTeam.color }}
      />
      <span className="text-sm font-medium text-muted-foreground">
        {currentTeam.name}
      </span>
    </div>
  )
}