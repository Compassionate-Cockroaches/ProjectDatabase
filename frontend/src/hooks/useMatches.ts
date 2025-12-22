import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/matchServices";
import type { MatchCreate, MatchUpdate } from "@/types/match";

export const useMatches = (params?: {
  skip?: number;
  limit?: number;
  tournament_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
}) => {
  return useQuery({
    queryKey: ["matches", params],
    queryFn: () => matchService.getAll(params),
  });
};

export const useMatch = (id: string) => {
  return useQuery({
    queryKey: ["matches", id],
    queryFn: () => matchService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatchCreate) => matchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchUpdate }) =>
      matchService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches", variables.id] });
    },
  });
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => matchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};
