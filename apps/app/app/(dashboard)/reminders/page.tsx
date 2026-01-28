"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useListReminders, Reminder } from "@/hooks/use-reminders"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { ReminderDrawer } from "@/components/reminder-drawer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { Input, InputGroup, InputLeftAddon } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"

export default function RemindersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState("all")
  const limit = 10
  
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleEditReminder = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder)
    setIsDrawerOpen(true)
  }, [])

  const columns = useMemo(() => getColumns(handleEditReminder), [handleEditReminder])

  const { data } = useListReminders({ page, limit, search: debouncedSearch, status })
  
  const totalPages = data?.total_pages || 1

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            View and manage all your scheduled and past reminders.
          </p>
        </div>
        <ReminderDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          reminder={selectedReminder}
        />
      </div>
      
      

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Tabs
          value={status}
          onValueChange={(val) => {
            setStatus(val)
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
        <InputGroup className="max-w-sm">
          <InputLeftAddon>
            <Search className="h-4 w-4" />
          </InputLeftAddon>
          <Input
            placeholder="Search reminders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              // Resetting page here might be premature if we wait for debounce, 
              // but typically we want to reset UI page immediately or wait?
              // Ideally wait for debounce.
              // I will remove setPage(1) here and add a useEffect for debouncedSearch.
            }}
            className="pl-8"
          />
        </InputGroup>
      </div>

      <DataTable columns={columns} data={data?.items || []} />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) setPage(page - 1)
              }}
              aria-disabled={page <= 1}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
              {page}
            </PaginationLink>
          </PaginationItem>
           <PaginationItem>
                <div className="flex items-center text-sm text-muted-foreground px-2">
                     of {totalPages}
                </div>
           </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page < totalPages) setPage(page + 1)
              }}
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
