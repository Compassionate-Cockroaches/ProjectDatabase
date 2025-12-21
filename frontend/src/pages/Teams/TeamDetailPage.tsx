import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconTrophy,
  IconSwords,
  IconUsers,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { teamService } from "@/services/teamServices";

const CHART_COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
  quinary: "var(--chart-5)",
};

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [matchPage, setMatchPage] = useState(0);
  const MATCHES_PER_PAGE = 10;

  // Fetch team details
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => teamService.getById(teamId!),
    enabled: !!teamId,
  });

  // Fetch team stats
  const { data: teamStats, isLoading: statsLoading } = useQuery({
    queryKey: ["team-stats", teamId],
    queryFn: () => teamService.getStats(teamId!),
    enabled: !!teamId,
  });

  // Fetch tournament history
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["team-tournaments", teamId],
    queryFn: () => teamService.getTournaments(teamId!),
    enabled: !!teamId,
  });

  // Fetch match history
  const { data: matchHistory, isLoading: matchesLoading } = useQuery({
    queryKey: ["team-matches", teamId, matchPage],
    queryFn: () =>
      teamService.getMatches(teamId!, {
        skip: matchPage * MATCHES_PER_PAGE,
        limit: MATCHES_PER_PAGE,
      }),
    enabled: !!teamId,
  });

  // Fetch player roster
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["team-players", teamId],
    queryFn: () => teamService.getPlayers(teamId!),
    enabled: !!teamId,
  });

  if (teamLoading || statsLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team || !teamStats) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Team not found</p>
          <Link to="/teams">
            <Button variant="outline">
              <IconArrowLeft className="mr-2" size={18} />
              Back to Teams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const performanceData = [
    { name: "Wins", value: teamStats.total_wins || 0 },
    { name: "Losses", value: teamStats.total_losses || 0 },
  ];

  const kdaData = [
    { name: "Kills", value: teamStats.avg_kills || 0 },
    { name: "Deaths", value: teamStats.avg_deaths || 0 },
    { name: "Assists", value: teamStats.avg_assists || 0 },
  ];

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Back Button */}
      <Link to="/teams">
        <Button variant="ghost" className="gap-2">
          <IconArrowLeft size={18} />
          Back to Teams
        </Button>
      </Link>

      {/* Team Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {team.team_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{team.team_name}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {teamStats.tournaments_participated || 0} Tournaments Participated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Games Played</p>
              <p className="text-2xl font-bold">{teamStats.total_games || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-primary">
                {teamStats.win_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Team KDA</p>
              <p className="text-2xl font-bold text-primary">
                {teamStats.avg_kda?.toFixed(2) || 0}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Wins</p>
              <p className="text-2xl font-bold text-green-500">
                {teamStats.total_wins || 0}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Avg Game Duration</p>
              <p className="text-2xl font-bold">
                {Math.floor((teamStats.avg_game_duration || 0) / 60)}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrophy size={20} />
              Win/Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ${entry.value} (${(
                      (entry.value / (teamStats.total_games || 1)) *
                      100
                    ).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.tertiary} />
                  <Cell fill={CHART_COLORS.quinary} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar size={20} />
              Average K/D/A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kdaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={CHART_COLORS.quaternary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tournament History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy size={20} />
            Tournament History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tournamentsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading tournament history...</p>
            </div>
          ) : tournaments && tournaments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead>Playoffs</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Losses</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {tournament.league}
                      </TableCell>
                      <TableCell>{tournament.year}</TableCell>
                      <TableCell>{tournament.split || "-"}</TableCell>
                      <TableCell>
                        {tournament.playoffs ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-green-500">
                        {tournament.wins}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {tournament.losses}
                      </TableCell>
                      <TableCell className="text-right">
                        {tournament.total_games > 0
                          ? ((tournament.wins / tournament.total_games) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                      <TableCell>
                        {tournament.result ? (
                          <Badge variant="secondary">{tournament.result}</Badge>
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
              <p>No tournament data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers size={20} />
            Player Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playersLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading player roster...</p>
            </div>
          ) : players && players.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">KDA</TableHead>
                    <TableHead className="text-right">K/D/A</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player: any) => (
                    <TableRow key={player.player_id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/players/${player.player_id}`}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {player.player_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {player.position ? (
                          <Badge variant="outline">{player.position}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.games_played}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.win_rate?.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {player.avg_kda?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {player.avg_kills?.toFixed(1)}/{player.avg_deaths?.toFixed(1)}/
                        {player.avg_assists?.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No player data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSwords size={20} />
            Match History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading match history...</p>
            </div>
          ) : matchHistory && matchHistory.length > 0 ? (
            <>
              <div className="space-y-3">
                {matchHistory.map((match: any) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={match.result ? "default" : "destructive"}
                            className="text-sm"
                          >
                            {match.result ? "Win" : "Loss"}
                          </Badge>
                          <span className="font-medium">
                            vs {match.opponent || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {match.match_date && (
                            <span>
                              {new Date(match.match_date).toLocaleDateString()}
                            </span>
                          )}
                          {match.tournament_name && (
                            <span>{match.tournament_name}</span>
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
                  disabled={matchHistory.length < MATCHES_PER_PAGE}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No match history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
