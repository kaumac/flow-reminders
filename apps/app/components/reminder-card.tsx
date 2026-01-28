"use client"

import { useState } from "react"
import { Bell, Calendar, Phone, Pencil, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
// @ts-ignore
import { countryCodeEmoji } from "country-code-emoji"
import { parsePhoneNumber, type CountryCode } from "libphonenumber-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { Reminder } from "@/hooks/use-reminders"
import { useDeleteReminder } from "@/hooks/use-reminders"

interface ReminderCardProps {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  showTimelineIcon?: boolean
}

export function ReminderCard({ reminder, onEdit, showTimelineIcon = false }: ReminderCardProps) {
  const { mutateAsync: deleteReminder, isPending: isDeleting } = useDeleteReminder()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteReminder(reminder.id)
      toast.success("Reminder deleted successfully")
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("Failed to delete reminder")
      console.error(error)
    }
  }

  // Common card content
  const content = (
    <div className="group relative p-4 rounded-xl border bg-background/50 hover:bg-background transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1">
          <h4 className="font-medium text-sm sm:text-base line-clamp-1">
            {reminder.title}
          </h4>
          {reminder.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {reminder.description}
            </p>
          )}
          
          <div className="pt-2 flex flex-wrap gap-2">
            {/* Conditional rendering for date if not shown via timeline context, 
                but here we just show what was in the original timeline or page */}
            {reminder.scheduled_time && (
                <Badge variant="secondary" className="gap-1 w-fit text-[10px] sm:text-xs font-normal">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(reminder.scheduled_time), { addSuffix: true })}
                </Badge>
            )}
            <Badge
                className="rounded-full flex items-center gap-1 text-[10px] sm:text-xs font-normal"
                variant="secondary"
            >
                {(() => {
                  try {
                    const parsed = parsePhoneNumber(reminder.phone_to_call)
                    if (parsed) {
                      const country = parsed.country as CountryCode
                      return (
                        <>
                          {country && <span className="text-sm leading-none">{countryCodeEmoji(country)}</span>}
                          {parsed.formatInternational()}
                        </>
                      )
                    }
                  } catch (_) {
                    // Ignore parsing errors
                  }
                  return (
                    <>
                      <Phone className="h-3 w-3" />
                      {reminder.phone_to_call}
                    </>
                  )
                })()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md border shadow-sm p-1">
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => onEdit(reminder)}
        >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
        </Button>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the reminder "{reminder.title}" and cancel the scheduled call.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button 
                variant="destructive" 
                onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
  
  if (showTimelineIcon) {
      return (
        <div key={reminder.id} className="relative pb-12 pl-10 last:pb-0">
            {/* Timeline Icon */}
            <div className="absolute left-px flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-background border z-10">
                <Bell className="h-5 w-5 text-muted-foreground" />
            </div>   
             {content}
        </div>
      )
  }

  return content
}
