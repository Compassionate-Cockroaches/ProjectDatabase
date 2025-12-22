import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentService } from "@/services/tournamentServices";
import type { TournamentCreate, TournamentUpdate } from "@/types/tournament";

export const useTournaments = (params?: {
  skip?: number;
  limit?: number;
  year?: number;
  league?: string;
  playoffs?: boolean;
  sort_by?: string;
  sort_order?: string;
}) => {
  return useQuery({
    queryKey: ["tournaments", params],
    queryFn: () => tournamentService.getAll(params),
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ["tournaments", id],
    queryFn: () => tournamentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TournamentCreate) => tournamentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TournamentUpdate }) =>
      tournamentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({
        queryKey: ["tournaments", variables.id],
      });
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
};
