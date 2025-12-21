import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/teamServices";
import type { TeamCreate, TeamUpdate } from "../types/team";

export const useTeams = (params?: { skip?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["teams", params],
    queryFn: () => teamService.getAll(params),
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ["teams", id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamCreate) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamUpdate }) =>
      teamService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};
