"use client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReminderDrawer } from "@/components/reminder-drawer";
import { useListReminders } from "@/hooks/use-reminders";
import { RemindersTimeline } from "@/components/reminders-timeline";

export default function Home() {
  const { data: reminders, isLoading, error } = useListReminders();
  const now = new Date();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sort upcoming by date ascending (soonest first)
  const upcomingReminders =
    reminders
      ?.filter((r) => !r.scheduled_time || new Date(r.scheduled_time) > now)
      .sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return (
          new Date(a.scheduled_time).getTime() -
          new Date(b.scheduled_time).getTime()
        );
      }) ?? [];

  // Sort past by date descending (most recent first)
  const pastReminders =
    reminders
      ?.filter((r) => r.scheduled_time && new Date(r.scheduled_time) <= now)
      .sort(
        (a, b) =>
          new Date(b.scheduled_time!).getTime() -
          new Date(a.scheduled_time!).getTime()
      ) ?? [];



  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load reminders. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] ">
      {/* Main Content (Upcoming) */}
      <div className="flex-1 p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Upcoming reminders
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks and future reminders.
            </p>
          </div>
          <ReminderDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
        </div>
        <RemindersTimeline 
          reminders={upcomingReminders} 
          onCreateReminder={() => setIsDrawerOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* Right Sidebar (Past) */}
      <div className="w-full lg:w-80 xl:w-96 border-l bg-muted/30 p-6">
        <div className="sticky top-6">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
            Past Reminders
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
              {pastReminders.length}
            </span>
          </h2>
          <div className="space-y-4">
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="p-4 rounded-xl border bg-background/50 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                    <Skeleton className="h-2 w-1/3" />
                 </div>
               ))
            ) : pastReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No past reminders found.
              </p>
            ) : (
              pastReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-4 rounded-xl border bg-background/50 hover:bg-background transition-colors"
                >
                  <h4 className="font-medium text-sm line-clamp-1">
                    {reminder.title}
                  </h4>
                  {reminder.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {reminder.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                    {new Date(reminder.scheduled_time!).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
