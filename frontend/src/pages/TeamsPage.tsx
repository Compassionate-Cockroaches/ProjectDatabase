import React, { useState } from "react";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/useTeams";
import { useDebounce } from "@/hooks/useDebounce";
import type { Team, TeamCreate, TeamUpdate } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { IconEdit, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";

const ITEMS_PER_PAGE = 10;

const TeamsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: teams, isLoading, isError } = useTeams({ 
    skip: page * ITEMS_PER_PAGE, 
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined
  });
  
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<TeamCreate>({ team_name: "" });
  const [editTeam, setEditTeam] = useState<TeamUpdate>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(newTeam);
    setNewTeam({ team_name: "" });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTeam) {
      await updateMutation.mutateAsync({ id: currentTeam.id, data: editTeam });
      setIsEditModalOpen(false);
      setCurrentTeam(null);
      setEditTeam({});
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (teamToDelete) {
      await deleteMutation.mutateAsync(teamToDelete.id);
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const hasNextPage = teams && teams.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 0;

  if (isLoading) return <div className="container mx-auto py-10">Loading teams...</div>;
  if (isError) return <div className="container mx-auto py-10">Error loading teams.</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus size={18} />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newTeamName" className="text-right">
                  Team Name
                </Label>
                <Input
                  id="newTeamName"
                  value={newTeam.team_name}
                  onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead className="text-right w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.team_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentTeam(team);
                          setEditTeam({ team_name: team.team_name });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(team)}
                      >
                        <IconTrash size={18} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No teams found
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
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTeamName" className="text-right">
                Team Name
              </Label>
              <Input
                id="editTeamName"
                value={editTeam.team_name ?? ""}
                onChange={(e) => setEditTeam({ ...editTeam, team_name: e.target.value })}
                className="col-span-3"
                required
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team "{teamToDelete?.team_name}". This action cannot be undone.
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

export default TeamsPage;
