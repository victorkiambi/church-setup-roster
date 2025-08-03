'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { teamsApi } from '@/lib/supabase'
import { Plus } from 'lucide-react'

interface AddTeamProps {
  onTeamAdded: () => void
  trigger?: React.ReactNode
}

const TEAM_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
]

export function AddTeam({ onTeamAdded, trigger }: AddTeamProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    admin_name: '',
    admin_phone: '',
    color: TEAM_COLORS[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await teamsApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        admin_name: formData.admin_name.trim() || undefined,
        admin_phone: formData.admin_phone.trim() || undefined,
        color: formData.color
      })
      
      setFormData({
        name: '',
        description: '',
        admin_name: '',
        admin_phone: '',
        color: TEAM_COLORS[0]
      })
      setOpen(false)
      onTeamAdded()
    } catch (error) {
      console.error('Error adding team:', error)
      alert('Failed to add team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Team
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Create a new team that can manage their own roster independently.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Team Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Worship Team"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Brief description of the team's role"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admin_name" className="text-right">
                Admin Name
              </Label>
              <Input
                id="admin_name"
                value={formData.admin_name}
                onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                className="col-span-3"
                placeholder="Team leader/supervisor name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admin_phone" className="text-right">
                Admin Phone
              </Label>
              <Input
                id="admin_phone"
                type="tel"
                value={formData.admin_phone}
                onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                className="col-span-3"
                placeholder="+254712345678"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Team Color
              </Label>
              <div className="col-span-3 flex gap-2 flex-wrap">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}