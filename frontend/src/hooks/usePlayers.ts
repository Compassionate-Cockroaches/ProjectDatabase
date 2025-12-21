import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playerService } from "../services/playerServices";
import type { PlayerCreate, PlayerUpdate } from "../types/player";

export const usePlayers = (params?: { 
  skip?: number; 
  limit?: number; 
  search?: string; 
  position?: string;
  sort_by?: string;
  sort_order?: string;
}) => {
  return useQuery({
    queryKey: ["players", params],
    queryFn: () => playerService.getAll(params),
  });
};

export const usePlayer = (id: string) => {
  return useQuery({
    queryKey: ["players", id],
    queryFn: () => playerService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({ 
    mutationFn: (data: PlayerCreate) => playerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlayerUpdate }) =>
      playerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", variables.id] });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
};
