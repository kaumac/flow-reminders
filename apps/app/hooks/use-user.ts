import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface User {
  id: number;
  phone_number: string;
}

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await api.get<User>("/me");
      return data;
    },
    // Keep user data fresh but don't over-fetch
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on 401
  });
}
