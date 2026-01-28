"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useListReminders, Reminder } from "@/hooks/use-reminders"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { ReminderDrawer } from "@/components/reminder-drawer"
import { ContentPlaceholder } from "@/components/content-placeholder"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, PlusCircle } from "lucide-react"
import { Input, InputGroup, InputLeftAddon } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import completedTaskImage from "../../../public/images/completed-task-31.png"

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

  const { data, isLoading } = useListReminders({ page, limit, search: debouncedSearch, status })
  
  const isEmptyState = !isLoading && data?.items?.length === 0 && search === "" && status === "all"
  
  const totalPages = data?.total_pages || 1

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  return (
    <div className="container p-10 space-y-6">
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            View and manage all your scheduled and past reminders.
          </p>
        </div>
        <ReminderDrawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            setIsDrawerOpen(open)
            if (!open) {
              setSelectedReminder(null)
            }
          }}
          reminder={selectedReminder}
        />
      </div>
      
      

      {!isEmptyState && (
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
            }}
            className="pl-8"
          />
        </InputGroup>
      </div>
      )}

      {!isLoading && data?.items?.length === 0 ? (
        <ContentPlaceholder
          placeholderImage={completedTaskImage}
          title="No reminders found"
          description="It looks like you don't have any reminders matching your criteria."
          buttonLabel="Create Reminder"
          buttonOnPress={() => {
            setSelectedReminder(null)
            setIsDrawerOpen(true)
          }}
          buttonIcon={PlusCircle}
        />
      ) : (
        <>
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
                  size="default"
                  className={
                    page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive size="icon" onClick={(e) => e.preventDefault()}>
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
                  size="default"
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  )
}
