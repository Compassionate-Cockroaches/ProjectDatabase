import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconTrophy,
  IconUsers,
  IconSwords,
  IconChartBar,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { tournamentService } from "@/services/tournamentServices";

const CHART_COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
  quinary: "var(--chart-5)",
};

export default function TournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [matchPage, setMatchPage] = useState(0);
  const MATCHES_PER_PAGE = 10;

  // Fetch tournament details
  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournaments", tournamentId],
    queryFn: () => tournamentService.getById(tournamentId!),
    enabled: !!tournamentId,
  });

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: () => tournamentService.getTeams(tournamentId!),
    enabled: !!tournamentId,
  });

  // Fetch matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["tournament-matches", tournamentId, matchPage],
    queryFn: () =>
      tournamentService.getMatches(tournamentId!, {
        skip: matchPage * MATCHES_PER_PAGE,
        limit: MATCHES_PER_PAGE,
      }),
    enabled: !!tournamentId,
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["tournament-stats", tournamentId],
    queryFn: () => tournamentService.getStats(tournamentId!),
    enabled: !!tournamentId,
  });

  if (tournamentLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Tournament not found</p>
          <Link to="/tournaments">
            <Button variant="outline">
              <IconArrowLeft className="mr-2" size={18} />
              Back to Tournaments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Back Button */}
      <Link to="/tournaments">
        <Button variant="ghost" className="gap-2">
          <IconArrowLeft size={18} />
          Back to Tournaments
        </Button>
      </Link>

      {/* Tournament Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <IconTrophy size={48} className="text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">
                    {tournament.league} {tournament.year}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {tournament.split && (
                      <Badge variant="outline">{tournament.split}</Badge>
                    )}
                    {tournament.playoffs && (
                      <Badge variant="default">Playoffs</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Total Teams</p>
              <p className="text-2xl font-bold">{tournament.total_teams || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Total Matches</p>
              <p className="text-2xl font-bold">{tournament.total_matches || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Avg Duration</p>
              <p className="text-2xl font-bold">
                {stats?.avg_game_duration
                  ? `${Math.floor(stats.avg_game_duration / 60)}m`
                  : "-"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Year</p>
              <p className="text-2xl font-bold">{tournament.year}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Standings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers size={20} />
            Team Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading team standings...</p>
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Losses</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team: any, idx: number) => (
                    <TableRow key={team.team_id}>
                      <TableCell className="font-semibold">{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to={`/teams/${team.team_id}`}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {team.team_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {team.games_played}
                      </TableCell>
                      <TableCell className="text-right text-green-500">
                        {team.wins}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {team.losses}
                      </TableCell>
                      <TableCell className="text-right">
                        {team.win_rate?.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {team.result ? (
                          <Badge variant="secondary">{team.result}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No team data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Stats */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChartBar size={20} />
                Top Players (KDA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.top_players && stats.top_players.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_players.slice(0, 5).map((player: any, idx: number) => (
                    <div
                      key={player.player_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <div>
                          <Link
                            to={`/players/${player.player_id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors"
                          >
                            {player.player_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {player.team_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {player.avg_kda?.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.games_played} games
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No player data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Champion Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTrophy size={20} />
                Most Picked Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.champion_stats && stats.champion_stats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.champion_stats.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="champion" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="picks"
                      fill={CHART_COLORS.quaternary}
                      name="Picks"
                    />
                    <Bar dataKey="wins" fill={CHART_COLORS.tertiary} name="Wins" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No champion data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSwords size={20} />
            Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading matches...</p>
            </div>
          ) : matches && matches.length > 0 ? (
            <>
              <div className="space-y-3">
                {matches.map((match: any) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          {match.teams?.map((team: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={`font-medium ${team.result ? 'text-green-500' : 'text-red-500'}`}>
                                {team.team_name}
                              </span>
                              <Badge variant={team.result ? "default" : "outline"} className="text-xs">
                                {team.result ? "W" : "L"}
                              </Badge>
                              {idx === 0 && match.teams.length > 1 && (
                                <span className="text-muted-foreground">vs</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {match.match_date && (
                            <span>
                              {new Date(match.match_date).toLocaleDateString()}
                            </span>
                          )}
                          {match.patch && <Badge variant="outline">{match.patch}</Badge>}
                          {match.game_length && (
                            <span>
                              {Math.floor(match.game_length / 60)}m{" "}
                              {match.game_length % 60}s
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={`/matches/${match.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMatchPage((p) => Math.max(0, p - 1))}
                  disabled={matchPage === 0}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {matchPage + 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMatchPage((p) => p + 1)}
                  disabled={matches.length < MATCHES_PER_PAGE}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No match data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
