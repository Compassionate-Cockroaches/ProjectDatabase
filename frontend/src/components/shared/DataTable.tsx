import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_CONFIG } from "@/constants/app";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  searchable,
  searchPlaceholder = "Search...",
  onSearch,
  pagination,
  emptyState,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const isEmpty = data.length === 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-64"
                >
                  {emptyState ? (
                    <EmptyState {...emptyState} />
                  ) : (
                    <EmptyState
                      title="No data found"
                      description="Try adjusting your filters or search query"
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.cell(row)}</TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && !isEmpty && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) =>
                pagination.onPageSizeChange(Number(value))
              }
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_CONFIG.PAGINATION.SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Page {pagination.pageIndex + 1} of{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onPageChange(0)}
                disabled={pagination.pageIndex === 0}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  pagination.onPageChange(pagination.pageIndex - 1)
                }
                disabled={pagination.pageIndex === 0}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  pagination.onPageChange(pagination.pageIndex + 1)
                }
                disabled={
                  pagination.pageIndex >=
                  Math.ceil(pagination.total / pagination.pageSize) - 1
                }
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  pagination.onPageChange(
                    Math.ceil(pagination.total / pagination.pageSize) - 1
                  )
                }
                disabled={
                  pagination.pageIndex >=
                  Math.ceil(pagination.total / pagination.pageSize) - 1
                }
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
