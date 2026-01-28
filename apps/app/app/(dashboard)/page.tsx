"use client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReminderDrawer } from "@/components/reminder-drawer";
import { useListReminders, type Reminder } from "@/hooks/use-reminders";
import { RemindersTimeline } from "@/components/reminders-timeline";
import { ReminderCard } from "@/components/reminder-card";

export default function Home() {
  const { data, isLoading, error } = useListReminders({ limit: 100 });
  const reminders = data?.items;
  const now = new Date();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const handleCreateReminder = () => {
      setSelectedReminder(null);
      setIsDrawerOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
      setSelectedReminder(reminder);
      setIsDrawerOpen(true);
  };

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
          <ReminderDrawer 
            open={isDrawerOpen} 
            onOpenChange={setIsDrawerOpen} 
            reminder={selectedReminder}
          />
        </div>
        <RemindersTimeline 
          reminders={upcomingReminders} 
          onCreateReminder={handleCreateReminder}
          onEdit={handleEditReminder}
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
                <ReminderCard 
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEditReminder}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
