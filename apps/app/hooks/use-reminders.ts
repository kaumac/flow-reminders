import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Reminder {
  id: number;
  created_at: string;
  title: string;
  description?: string;
  scheduled_time?: string;
  user_id: number;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  scheduled_time?: string;
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReminderPayload) => {
      const { data } = await api.post<Reminder>("/reminders", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useListReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data } = await api.get<Reminder[]>("/reminders");
      return data;
    },
  });
}
