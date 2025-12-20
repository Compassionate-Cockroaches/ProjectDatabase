import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userServices";
import type { UserCreate, UserUpdate } from "../types/user";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: userService.getCurrentUser,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreate) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};