import React, { useState } from "react";
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament } from "@/hooks/useTournaments";
import type { Tournament, TournamentCreate, TournamentUpdate } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconEdit, IconTrash, IconPlus, IconX, IconFilter } from "@tabler/icons-react";

const ITEMS_PER_PAGE = 10;
const LEAGUES = ["LCK", "LPL", "LEC", "LCS", "PCS", "VCS", "CBLOL", "LLA", "LJL", "LCO"];

const TournamentsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");
  const [playoffsFilter, setPlayoffsFilter] = useState<string>("");
  
  const { data: tournaments, isLoading, isError } = useTournaments({ 
    skip: page * ITEMS_PER_PAGE, 
    limit: ITEMS_PER_PAGE,
    year: yearFilter ? parseInt(yearFilter) : undefined,
    league: leagueFilter || undefined,
    playoffs: playoffsFilter ? playoffsFilter === "true" : undefined
  });
  
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const deleteMutation = useDeleteTournament();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [newTournament, setNewTournament] = useState<TournamentCreate>({ league: "", year: new Date().getFullYear() });
  const [editTournament, setEditTournament] = useState<TournamentUpdate>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(newTournament);
    setNewTournament({ league: "", year: new Date().getFullYear() });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTournament) {
      await updateMutation.mutateAsync({ id: currentTournament.id, data: editTournament });
      setIsEditModalOpen(false);
      setCurrentTournament(null);
      setEditTournament({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tournament?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleClearFilters = () => {
    setYearFilter("");
    setLeagueFilter("");
    setPlayoffsFilter("");
    setPage(0);
  };

  const hasActiveFilters = yearFilter || leagueFilter || playoffsFilter;
  const hasNextPage = tournaments && tournaments.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 0;

  // Generate year options (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (isLoading) return <div className="container mx-auto py-10">Loading tournaments...</div>;
  if (isError) return <div className="container mx-auto py-10">Error loading tournaments.</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus size={18} />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newLeague" className="text-right">
                  League
                </Label>
                <Select
                  value={newTournament.league}
                  onValueChange={(value) => setNewTournament({ ...newTournament, league: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAGUES.map((league) => (
                      <SelectItem key={league} value={league}>
                        {league}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newYear" className="text-right">
                  Year
                </Label>
                <Input
                  id="newYear"
                  type="number"
                  value={newTournament.year}
                  onChange={(e) => setNewTournament({ ...newTournament, year: parseInt(e.target.value) })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newSplit" className="text-right">
                  Split
                </Label>
                <Input
                  id="newSplit"
                  value={newTournament.split || ""}
                  onChange={(e) => setNewTournament({ ...newTournament, split: e.target.value })}
                  className="col-span-3"
                  placeholder="Spring, Summer"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPlayoffs" className="text-right">
                  Playoffs
                </Label>
                <input
                  id="newPlayoffs"
                  type="checkbox"
                  checked={newTournament.playoffs || false}
                  onChange={(e) => setNewTournament({ ...newTournament, playoffs: e.target.checked })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Tournament"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-4">
        <Select value={yearFilter} onValueChange={(value) => { setYearFilter(value); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <IconFilter className="mr-2" size={16} />
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Years</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={leagueFilter} onValueChange={(value) => { setLeagueFilter(value); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Leagues</SelectItem>
            {LEAGUES.map((league) => (
              <SelectItem key={league} value={league}>
                {league}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={playoffsFilter} onValueChange={(value) => { setPlayoffsFilter(value); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Playoffs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            <SelectItem value="true">Playoffs</SelectItem>
            <SelectItem value="false">Regular Season</SelectItem>
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
              <TableHead>League</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Split</TableHead>
              <TableHead>Playoffs</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments && tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">{tournament.league}</TableCell>
                  <TableCell>{tournament.year}</TableCell>
                  <TableCell>{tournament.split || "-"}</TableCell>
                  <TableCell>{tournament.playoffs ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentTournament(tournament);
                          setEditTournament({
                            league: tournament.league,
                            year: tournament.year,
                            split: tournament.split,
                            playoffs: tournament.playoffs,
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tournament.id)}
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
                  No tournaments found
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLeague" className="text-right">
                League
              </Label>
              <Select
                value={editTournament.league}
                onValueChange={(value) => setEditTournament({ ...editTournament, league: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {LEAGUES.map((league) => (
                    <SelectItem key={league} value={league}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editYear" className="text-right">
                Year
              </Label>
              <Input
                id="editYear"
                type="number"
                value={editTournament.year ?? ""}
                onChange={(e) => setEditTournament({ ...editTournament, year: parseInt(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSplit" className="text-right">
                Split
              </Label>
              <Input
                id="editSplit"
                value={editTournament.split ?? ""}
                onChange={(e) => setEditTournament({ ...editTournament, split: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPlayoffs" className="text-right">
                Playoffs
              </Label>
              <input
                id="editPlayoffs"
                type="checkbox"
                checked={editTournament.playoffs ?? false}
                onChange={(e) => setEditTournament({ ...editTournament, playoffs: e.target.checked })}
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

export default TournamentsPage;
