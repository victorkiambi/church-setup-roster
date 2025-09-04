'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { AddMember } from '@/components/add-member'
import { membersApi, type Member } from '@/lib/neon'
import { useTeam } from '@/contexts/team-context'
import { formatDate } from '@/lib/utils'
import { Phone, ToggleLeft, ToggleRight } from 'lucide-react'

export default function MembersPage() {
  const { currentTeam } = useTeam()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const loadMembers = useCallback(async () => {
    if (!currentTeam?.id) return
    try {
      const data = await membersApi.getAll(currentTeam.id)
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
      alert('Failed to load members. Please check your database configuration.')
    } finally {
      setLoading(false)
    }
  }, [currentTeam?.id])

  const toggleMemberStatus = async (member: Member) => {
    try {
      await membersApi.toggleActive(member.id, !member.isActive)
      await loadMembers() // Refresh the list
    } catch (error) {
      console.error('Error toggling member status:', error)
      alert('Failed to update member status.')
    }
  }

  useEffect(() => {
    loadMembers()
  }, [currentTeam?.id, loadMembers])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{currentTeam?.name || 'Team'} Members</CardTitle>
            <CardDescription>
              Manage {currentTeam?.name?.toLowerCase() || 'team'} members who can be assigned to duties
            </CardDescription>
          </div>
          <AddMember onMemberAdded={loadMembers} />
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No members found</p>
              <AddMember onMemberAdded={loadMembers} />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        {member.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{member.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.createdAt ? formatDate(member.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMemberStatus(member)}
                          className="w-full"
                        >
                          {member.isActive ? (
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
            Total: {members.length} members 
            ({members.filter(m => m.isActive).length} active, {members.filter(m => !m.isActive).length} inactive)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}