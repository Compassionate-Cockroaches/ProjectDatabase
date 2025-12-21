import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreatePlayer,
  useDeletePlayer,
  usePlayers,
  useUpdatePlayer,
} from "@/hooks/usePlayers";
import type { Player, PlayerCreate, PlayerUpdate } from "@/types/player";
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, { useState } from "react";

const ITEMS_PER_PAGE = 10;
const POSITIONS = ["Top", "Jungle", "Mid", "Bot", "Support"];

const PlayersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: players,
    isLoading,
    isError,
  } = usePlayers({
    skip: page * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    position: position || undefined,
  });

  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();
  const deleteMutation = useDeletePlayer();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState<PlayerCreate>({ player_name: "" });
  const [editPlayer, setEditPlayer] = useState<PlayerUpdate>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(newPlayer);
    setNewPlayer({ player_name: "" });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlayer) {
      await updateMutation.mutateAsync({
        id: currentPlayer.id,
        data: editPlayer,
      });
      setIsEditModalOpen(false);
      setCurrentPlayer(null);
      setEditPlayer({});
    }
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (playerToDelete) {
      await deleteMutation.mutateAsync(playerToDelete.id);
      setIsDeleteDialogOpen(false);
      setPlayerToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setPosition("");
    setPage(0);
  };

  const hasActiveFilters = search || position;
  const hasNextPage = players && players.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 0;

  // Helper function to format team names
  const getTeamsDisplay = (teamNames?: string[]) => {
    if (!teamNames || teamNames.length === 0) return "-";
    return teamNames.join(", ");
  };

  if (isLoading)
    return <div className="container mx-auto py-10">Loading players...</div>;
  if (isError)
    return (
      <div className="container mx-auto py-10">Error loading players.</div>
    );

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Players</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus size={18} />
              Create Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPlayerName" className="text-right">
                  Player Name
                </Label>
                <Input
                  id="newPlayerName"
                  value={newPlayer.player_name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, player_name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPosition" className="text-right">
                  Position
                </Label>
                <Select
                  value={newPlayer.position || ""}
                  onValueChange={(value) =>
                    setNewPlayer({ ...newPlayer, position: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Player"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative max-w-sm flex-1">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={position}
          onValueChange={(value) => {
            setPosition(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Positions</SelectItem>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={handleClearFilters}>
            <IconX size={18} />
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Team Played</TableHead>
              <TableHead className="text-right w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players && players.length > 0 ? (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {player.player_name}
                  </TableCell>
                  <TableCell>{player.position || "-"}</TableCell>
                  <TableCell>{getTeamsDisplay(player.team_names)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentPlayer(player);
                          setEditPlayer({
                            player_name: player.player_name,
                            position: player.position,
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(player)}
                      >
                        <IconTrash size={18} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No players found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">Page {page + 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPlayerName" className="text-right">
                Player Name
              </Label>
              <Input
                id="editPlayerName"
                value={editPlayer.player_name ?? ""}
                onChange={(e) =>
                  setEditPlayer({ ...editPlayer, player_name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPosition" className="text-right">
                Position
              </Label>
              <Select
                value={editPlayer.position || ""}
                onValueChange={(value) =>
                  setEditPlayer({ ...editPlayer, position: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the player "{playerToDelete?.player_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlayersPage;
