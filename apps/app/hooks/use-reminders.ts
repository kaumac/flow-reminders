import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Reminder {
  id: number;
  created_at: string;
  title: string;
  description?: string;
  scheduled_time?: string;
  phone_to_call: string;
  user_id: number;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  scheduled_time?: string;
  phone_to_call: string;
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

export type UpdateReminderPayload = CreateReminderPayload;

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateReminderPayload }) => {
      const { data } = await api.put<Reminder>(`/reminders/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}
