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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  useCreateMatch,
  useDeleteMatch,
  useMatches,
  useUpdateMatch,
} from "@/hooks/useMatches";
import { useTournaments } from "@/hooks/useTournaments";
import type { Match, MatchCreate, MatchUpdate } from "@/types/match";
import {
  IconEdit,
  IconFilter,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const MatchesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tournamentFilter, setTournamentFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("match_date");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const {
    data: matches,
    isLoading,
    isError,
  } = useMatches({
    skip: page * pageSize,
    limit: pageSize,
    tournament_id: tournamentFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  const { data: tournaments } = useTournaments({ limit: 100 }); // Get more tournaments for filter

  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState<MatchCreate>({ tournament_id: "" });
  const [editMatch, setEditMatch] = useState<MatchUpdate>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(newMatch);
    setNewMatch({ tournament_id: "" });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMatch) {
      await updateMutation.mutateAsync({
        id: currentMatch.id,
        data: editMatch,
      });
      setIsEditModalOpen(false);
      setCurrentMatch(null);
      setEditMatch({});
    }
  };

  const handleDeleteClick = (match: Match) => {
    setMatchToDelete(match);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (matchToDelete) {
      await deleteMutation.mutateAsync(matchToDelete.id);
      setIsDeleteDialogOpen(false);
      setMatchToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setTournamentFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  const hasActiveFilters = tournamentFilter || dateFrom || dateTo;
  const hasNextPage = matches && matches.length === pageSize;
  const hasPrevPage = page > 0;

  // Helper function to get tournament display name
  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments?.find((t) => t.id === tournamentId);
    return tournament
      ? `${tournament.league} ${tournament.year} ${
          tournament.split || ""
        }`.trim()
      : tournamentId;
  };

  // Helper functions to get team names
  const getTeamA = (teamNames?: string[]) => {
    if (!teamNames || teamNames.length === 0) return "-";
    return teamNames[0] || "-";
  };

  const getTeamB = (teamNames?: string[]) => {
    if (!teamNames || teamNames.length < 2) return "-";
    return teamNames[1] || "-";
  };

  if (isLoading)
    return <div className="container mx-auto py-10">Loading matches...</div>;
  if (isError)
    return (
      <div className="container mx-auto py-10">Error loading matches.</div>
    );

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Matches</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus size={18} />
              Create Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newTournamentId" className="text-right">
                  Tournament
                </Label>
                <Select
                  value={newMatch.tournament_id}
                  onValueChange={(value) =>
                    setNewMatch({ ...newMatch, tournament_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments?.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        {tournament.league} {tournament.year} {tournament.split}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newGameNumber" className="text-right">
                  Game Number
                </Label>
                <Input
                  id="newGameNumber"
                  type="number"
                  value={newMatch.game_number || ""}
                  onChange={(e) =>
                    setNewMatch({
                      ...newMatch,
                      game_number: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPatch" className="text-right">
                  Patch
                </Label>
                <Input
                  id="newPatch"
                  value={newMatch.patch || ""}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, patch: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newMatchDate" className="text-right">
                  Match Date
                </Label>
                <Input
                  id="newMatchDate"
                  type="date"
                  value={newMatch.match_date || ""}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, match_date: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Match"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-4 flex-wrap">
        <Select
          value={tournamentFilter}
          onValueChange={(value) => {
            setTournamentFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <IconFilter className="mr-2" size={16} />
            <SelectValue placeholder="Tournament" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Tournaments</SelectItem>
            {tournaments?.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                {tournament.league} {tournament.year} {tournament.split}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(0);
          }}
          className="w-[150px]"
        />

        <Input
          type="date"
          placeholder="To date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(0);
          }}
          className="w-[150px]"
        />

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match_date">Date</SelectItem>
            <SelectItem value="game_length">Game Length</SelectItem>
            <SelectItem value="patch">Patch</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(value) => {
            setSortOrder(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Oldest First</SelectItem>
            <SelectItem value="desc">Newest First</SelectItem>
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
              <TableHead>Team A</TableHead>
              <TableHead>Team B</TableHead>
              <TableHead>Game #</TableHead>
              <TableHead>Tournament</TableHead>
              <TableHead>Patch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches && matches.length > 0 ? (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-semibold">
                    {getTeamA(match.team_names)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {getTeamB(match.team_names)}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/matches/${match.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {match.game_number || "-"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTournamentName(match.tournament_id)}
                  </TableCell>
                  <TableCell>{match.patch || "-"}</TableCell>
                  <TableCell>{match.match_date || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentMatch(match);
                          setEditMatch({
                            tournament_id: match.tournament_id,
                            game_number: match.game_number,
                            patch: match.patch,
                            match_date: match.match_date,
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(match)}
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
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No matches found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!hasPrevPage}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page + 1} of {hasNextPage ? `${page + 2}+` : page + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTournamentId" className="text-right">
                Tournament
              </Label>
              <Select
                value={editMatch.tournament_id}
                onValueChange={(value) =>
                  setEditMatch({ ...editMatch, tournament_id: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments?.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.league} {tournament.year} {tournament.split}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGameNumber" className="text-right">
                Game Number
              </Label>
              <Input
                id="editGameNumber"
                type="number"
                value={editMatch.game_number ?? ""}
                onChange={(e) =>
                  setEditMatch({
                    ...editMatch,
                    game_number: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPatch" className="text-right">
                Patch
              </Label>
              <Input
                id="editPatch"
                value={editMatch.patch ?? ""}
                onChange={(e) =>
                  setEditMatch({ ...editMatch, patch: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editMatchDate" className="text-right">
                Match Date
              </Label>
              <Input
                id="editMatchDate"
                type="date"
                value={editMatch.match_date ?? ""}
                onChange={(e) =>
                  setEditMatch({ ...editMatch, match_date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the match from "
              {matchToDelete
                ? getTournamentName(matchToDelete.tournament_id)
                : ""}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MatchesPage;
