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
import { AddMember } from '@/components/add-member'
import { membersApi, type Member } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Phone, ToggleLeft, ToggleRight } from 'lucide-react'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    try {
      const data = await membersApi.getAll()
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
      alert('Failed to load members. Please check your Supabase configuration.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMemberStatus = async (member: Member) => {
    try {
      await membersApi.toggleActive(member.id, !member.is_active)
      await loadMembers() // Refresh the list
    } catch (error) {
      console.error('Error toggling member status:', error)
      alert('Failed to update member status.')
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

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
            <CardTitle>Church Members</CardTitle>
            <CardDescription>
              Manage church members who can be assigned to setup duties
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
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMemberStatus(member)}
                          className="w-full"
                        >
                          {member.is_active ? (
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
            ({members.filter(m => m.is_active).length} active, {members.filter(m => !m.is_active).length} inactive)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}