"use client"

import { useState } from "react"
import { Bell, Calendar, Phone, Pencil, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
                  {format(new Date(reminder.scheduled_time), "PPP p")}
                </Badge>
            )}
            <Badge
                className="rounded-full flex items-center gap-1 text-[10px] sm:text-xs font-normal"
                variant="secondary"
            >
                <Phone className="h-3 w-3" />
                {reminder.phone_to_call}
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
            
            {/* Content wrapper to strip the Card-like padding if needed, 
                but looking at original RemindersTimeline, it didn't have a border card? 
                Actually original had: 
                <div key={reminder.id} className="p-4 rounded-xl border bg-background/50 ..."> (in page.tsx for past)
                BUT in RemindersTimeline it was:
                <div className="space-y-3"> -> <h3>...
                So RemindersTimeline style is DIFFERENT from Page.tsx style.
            */}
             
             {/* 
                I need to adapt. The user said "On reminders-timeline.tsx and page.tsx... display edit and delete buttons on hover".
                
                Page.tsx style: 
                <div className="p-4 rounded-xl border bg-background/50 hover:bg-background transition-colors">
                
                RemindersTimeline.tsx style:
                (Timeline structure) -> Content div -> h3, p, badges.
                
                I should apply the card style to RemindersTimeline content too? 
                Or keep the existing style and just add buttons?
                Reference: "On reminders-timeline.tsx ... display edit and delete buttons".
                The current RemindersTimeline has items in a timeline flow. Adding a border/card style might disrupt it 
                or improve it. 
                
                The user's Page.tsx snippet shows a Card style for Past Reminders.
                The RemindersTimeline is for Upcoming.
                
                I will make ReminderCard adaptable or just use the card style for both which looks cleaner.
                Or, I'll stick to the original markup for RemindersTimeline but wrap it in a group relative div to position buttons.
             */}
             
             {/* Let's try to maintain structural styling of Timeline but inject buttons. 
                 If I use ReminderCard here, it brings its own border and padding.
                 If I replace the inner content of Timeline item with ReminderCard, 
                 it will look like a Card attached to a timeline point. That is a good UI pattern.
             */}
             
             {content}
        </div>
      )
  }

  return content
}
