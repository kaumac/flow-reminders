"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Reminder } from "@/hooks/use-reminders"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ReminderActions } from "./reminder-actions"

export const getColumns = (onEdit: (reminder: Reminder) => void): ColumnDef<Reminder>[] => [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "scheduled_time",
    header: "Scheduled Time",
    cell: ({ row }) => {
      const date = row.getValue("scheduled_time") as string
      if (!date) return <span className="text-muted-foreground">-</span>
      return format(new Date(date), "PPp")
    },
  },
  {
    accessorKey: "phone_to_call",
    header: "Phone",
    cell: ({ row }) => {
        const phone = row.getValue("phone_to_call") as string
        return <span className="font-mono text-sm">{phone}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ReminderActions reminder={row.original} onEdit={onEdit} />,
  },
]
