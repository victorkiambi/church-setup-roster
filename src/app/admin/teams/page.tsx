'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTeam } from '@/components/add-team'
import type { Team } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils'
import { Users, Calendar, Phone, ToggleLeft, ToggleRight } from 'lucide-react'

interface TeamWithStats extends Team {
  memberCount?: number
  eventCount?: number
}

export default function TeamsManagementPage() {
  const [teams, setTeams] = useState<TeamWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const loadTeams = async () => {
    try {
      const teamsResponse = await fetch('/api/teams')
      if (!teamsResponse.ok) {
        throw new Error('Failed to fetch teams')
      }
      const teamsData = await teamsResponse.json()
      
      // Get stats for each team
      const teamsWithStats = await Promise.all(
        teamsData.map(async (team: Team) => {
          try {
            const [membersResponse, eventsResponse] = await Promise.all([
              fetch(`/api/members?teamId=${team.id}&activeOnly=true`),
              fetch(`/api/events?teamId=${team.id}&type=upcoming`)
            ])
            
            const members = membersResponse.ok ? await membersResponse.json() : []
            const events = eventsResponse.ok ? await eventsResponse.json() : []
            
            return {
              ...team,
              memberCount: members.length,
              eventCount: events.length
            }
          } catch (error) {
            console.error(`Error loading stats for team ${team.id}:`, error)
            return {
              ...team,
              memberCount: 0,
              eventCount: 0
            }
          }
        })
      )
      
      setTeams(teamsWithStats)
    } catch (error) {
      console.error('Error loading teams:', error)
      alert('Failed to load teams. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTeamStatus = async (team: Team) => {
    try {
      const response = await fetch(`/api/teams/${team.id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !team.isActive })
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle team status')
      }
      
      await loadTeams() // Refresh the list
    } catch (error) {
      console.error('Error toggling team status:', error)
      alert('Failed to update team status.')
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Manage all teams in the roster system
            </CardDescription>
          </div>
          <AddTeam onTeamAdded={loadTeams} />
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No teams found</p>
              <AddTeam onTeamAdded={loadTeams} />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: team.color || '#3B82F6' }}
                          />
                          <div>
                            <div className="font-medium">{team.name}</div>
                            {team.description && (
                              <div className="text-sm text-muted-foreground">
                                {team.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.adminName ? (
                          <div>
                            <div className="font-medium">{team.adminName}</div>
                            {team.adminPhone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span className="font-mono">{team.adminPhone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{team.memberCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{team.eventCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={team.isActive ? 'default' : 'secondary'}>
                          {team.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {team.createdAt ? formatDate(team.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTeamStatus(team)}
                          className="w-full"
                        >
                          {team.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-6 text-sm text-muted-foreground">
            Total: {teams.length} teams 
            ({teams.filter(t => t.isActive).length} active, {teams.filter(t => !t.isActive).length} inactive)
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid gap-4 mt-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {teams.reduce((sum, team) => sum + (team.memberCount || 0), 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {teams.reduce((sum, team) => sum + (team.eventCount || 0), 0)}
                </div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="h-4 w-4 bg-purple-600 rounded-full" />
              </div>
              <div>
                <div className="text-2xl font-bold">{teams.filter(t => t.isActive).length}</div>
                <p className="text-sm text-muted-foreground">Active Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}