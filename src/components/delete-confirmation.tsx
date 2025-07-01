'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Archive } from 'lucide-react'

interface DeleteConfirmationProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  children?: React.ReactNode
  variant?: 'delete' | 'archive'
  disabled?: boolean
}

export function DeleteConfirmation({ 
  title, 
  description, 
  onConfirm, 
  children,
  variant = 'delete',
  disabled = false
}: DeleteConfirmationProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to ${variant} item`)
    } finally {
      setLoading(false)
    }
  }

  const Icon = variant === 'archive' ? Archive : Trash2
  const actionText = variant === 'archive' ? 'Archive' : 'Delete'
  const colorClass = variant === 'archive' 
    ? 'bg-orange-600 hover:bg-orange-700' 
    : 'bg-red-600 hover:bg-red-700'

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className="text-gray-600 hover:text-red-600 hover:border-red-200"
          >
            <Icon className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${variant === 'archive' ? 'text-orange-600' : 'text-red-600'}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {variant === 'archive' && (
              <div className="mt-2 text-sm text-gray-600">
                Archived events can be restored later if needed.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={`${colorClass} text-white`}
          >
            {loading ? `${actionText}ing...` : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}