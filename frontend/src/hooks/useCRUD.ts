// frontend/src/hooks/useCRUD.ts
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CRUDService } from "@/types/common";
import { MESSAGES } from "@/constants/app";

interface UseCRUDOptions<T, TCreate, TUpdate> {
  entityName: string;
  queryKey: string[];
  service: CRUDService<T, TCreate, TUpdate>;
  initialPageSize?: number;
}

export function useCRUD<T extends { id: string }, TCreate = Partial<T>, TUpdate = Partial<T>>({
  entityName,
  queryKey,
  service,
  initialPageSize = 10,
}: UseCRUDOptions<T, TCreate, TUpdate>) {
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Fetch query
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, page, pageSize, searchQuery],
    queryFn: () =>
      service.getAll({
        skip: page * pageSize,
        limit: pageSize,
        search: searchQuery || undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: service.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(MESSAGES.SUCCESS.CREATE(entityName));
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || MESSAGES.ERROR.CREATE(entityName));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
      service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(MESSAGES.SUCCESS.UPDATE(entityName));
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || MESSAGES.ERROR.UPDATE(entityName));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: service.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(MESSAGES.SUCCESS.DELETE(entityName));
      setDeletingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || MESSAGES.ERROR.DELETE(entityName));
    },
  });

  // Actions
  const handleCreate = (data: TCreate) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: string, data: TUpdate) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (item: T) => setEditingItem(item);
  const closeEditModal = () => setEditingItem(null);

  const openDeleteDialog = (item: T) => setDeletingItem(item);
  const closeDeleteDialog = () => setDeletingItem(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  return {
    // Data
    data: data || [],
    isLoading,
    error,
    total: data?.length || 0,

    // Pagination
    pagination: {
      pageIndex: page,
      pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },

    // Search
    searchQuery,
    onSearch: handleSearch,

    // Modals/Dialogs
    modals: {
      create: {
        isOpen: isCreateModalOpen,
        open: openCreateModal,
        close: closeCreateModal,
      },
      edit: {
        isOpen: !!editingItem,
        item: editingItem,
        open: openEditModal,
        close: closeEditModal,
      },
      delete: {
        isOpen: !!deletingItem,
        item: deletingItem,
        open: openDeleteDialog,
        close: closeDeleteDialog,
      },
    },

    // Actions
    actions: {
      create: handleCreate,
      update: handleUpdate,
      delete: handleDelete,
    },

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}