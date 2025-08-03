'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { teamsApi, type Team } from '@/lib/supabase'

interface TeamContextType {
  currentTeam: Team | null
  teams: Team[]
  isLoading: boolean
  error: string | null
  switchTeam: (teamId: string) => void
  loadTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

// Default team ID for Setup team
const DEFAULT_SETUP_TEAM_ID = '11111111-1111-1111-1111-111111111111'

interface TeamProviderProps {
  children: React.ReactNode
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load teams from database
  const loadTeams = useCallback(async () => {
    try {
      setError(null)
      const teamsData = await teamsApi.getAll()
      setTeams(teamsData)
      
      // Set default team if none selected
      if (!currentTeam && teamsData.length > 0) {
        const savedTeamId = localStorage.getItem('selectedTeamId')
        let teamToSelect = teamsData[0] // Default to first team
        
        // Try to use saved team ID or default to Setup team
        if (savedTeamId) {
          const savedTeam = teamsData.find(t => t.id === savedTeamId)
          if (savedTeam) teamToSelect = savedTeam
        } else {
          const setupTeam = teamsData.find(t => t.id === DEFAULT_SETUP_TEAM_ID)
          if (setupTeam) teamToSelect = setupTeam
        }
        
        setCurrentTeam(teamToSelect)
        localStorage.setItem('selectedTeamId', teamToSelect.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
      console.error('Error loading teams:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentTeam])

  // Switch to a different team
  const switchTeam = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
      localStorage.setItem('selectedTeamId', teamId)
    }
  }, [teams])

  // Load teams on mount
  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const contextValue: TeamContextType = {
    currentTeam,
    teams,
    isLoading,
    error,
    switchTeam,
    loadTeams
  }

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

// Hook to get current team ID (useful for API calls)
export function useCurrentTeamId() {
  const { currentTeam } = useTeam()
  return currentTeam?.id || null
}