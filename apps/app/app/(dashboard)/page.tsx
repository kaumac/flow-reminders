"use client";

import { ReminderDrawer } from "@/components/reminder-drawer";
import { useListReminders } from "@/hooks/use-reminders";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: reminders, isLoading, error } = useListReminders();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-gray-500 mt-1">Manage your tasks and reminders.</p>
        </div>
        <ReminderDrawer />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Failed to load reminders. Please try again.
        </div>
      ) : reminders?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
          <p className="text-gray-500">No reminders yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders?.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{reminder.title}</h3>
                  {reminder.description && (
                    <p className="text-gray-600 mt-1">{reminder.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(reminder.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
