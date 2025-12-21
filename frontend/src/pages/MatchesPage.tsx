import React, { useState } from "react";
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/useMatches";
import { useTournaments } from "@/hooks/useTournaments";
import type { Match, MatchCreate, MatchUpdate } from "@/types/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconEdit, IconTrash, IconPlus, IconX, IconFilter } from "@tabler/icons-react";

const ITEMS_PER_PAGE = 10;

const MatchesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [tournamentFilter, setTournamentFilter] = useState<string>("");
  
  const { data: matches, isLoading, isError } = useMatches({ 
    skip: page * ITEMS_PER_PAGE, 
    limit: ITEMS_PER_PAGE,
    tournament_id: tournamentFilter || undefined
  });
  const { data: tournaments } = useTournaments({ limit: 100 }); // Get more tournaments for filter
  
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
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
      await updateMutation.mutateAsync({ id: currentMatch.id, data: editMatch });
      setIsEditModalOpen(false);
      setCurrentMatch(null);
      setEditMatch({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this match?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleClearFilters = () => {
    setTournamentFilter("");
    setPage(0);
  };

  const hasActiveFilters = tournamentFilter;
  const hasNextPage = matches && matches.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 0;

  // Helper function to get tournament display name
  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments?.find((t) => t.id === tournamentId);
    return tournament 
      ? `${tournament.league} ${tournament.year} ${tournament.split || ""}`.trim()
      : tournamentId;
  };

  if (isLoading) return <div className="container mx-auto py-10">Loading matches...</div>;
  if (isError) return <div className="container mx-auto py-10">Error loading matches.</div>;

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
                  onValueChange={(value) => setNewMatch({ ...newMatch, tournament_id: value })}
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
                  onChange={(e) => setNewMatch({ ...newMatch, game_number: e.target.value ? parseInt(e.target.value) : undefined })}
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
                  onChange={(e) => setNewMatch({ ...newMatch, patch: e.target.value })}
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
                  onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
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

      <div className="mb-4 flex gap-4">
        <Select value={tournamentFilter} onValueChange={(value) => { setTournamentFilter(value); setPage(0); }}>
          <SelectTrigger className="w-70">
            <IconFilter className="mr-2" size={16} />
            <SelectValue placeholder="Filter by Tournament" />
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
              <TableHead>Tournament</TableHead>
              <TableHead>Game #</TableHead>
              <TableHead>Patch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches && matches.length > 0 ? (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">{getTournamentName(match.tournament_id)}</TableCell>
                  <TableCell>{match.game_number || "-"}</TableCell>
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
                        onClick={() => handleDelete(match.id)}
                      >
                        <IconTrash size={18} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No matches found
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
        <div className="text-sm text-muted-foreground">
          Page {page + 1}
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
                onValueChange={(value) => setEditMatch({ ...editMatch, tournament_id: value })}
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
                onChange={(e) => setEditMatch({ ...editMatch, game_number: e.target.value ? parseInt(e.target.value) : undefined })}
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
                onChange={(e) => setEditMatch({ ...editMatch, patch: e.target.value })}
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
                onChange={(e) => setEditMatch({ ...editMatch, match_date: e.target.value })}
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
    </div>
  );
};

export default MatchesPage;
