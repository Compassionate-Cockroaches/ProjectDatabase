import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // fucking 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
