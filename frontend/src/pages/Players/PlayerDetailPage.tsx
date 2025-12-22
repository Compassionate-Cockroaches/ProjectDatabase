import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconTrophy,
  IconSwords,
  IconShield,
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
import { playerService } from "@/services/playerServices";
import type { ChampionStat, TeamInfo, MatchInfo } from "@/types/matchStats";

const CHART_COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
  quinary: "var(--chart-5)",
};

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const [matchPage, setMatchPage] = useState(0);
  const MATCHES_PER_PAGE = 10;

  // Fetch player details
  const { data: player, isLoading: playerLoading } = useQuery({
    queryKey: ["players", playerId],
    queryFn: () => playerService.getById(playerId!),
    enabled: !!playerId,
  });

  // Fetch match history
  const { data: matchHistory, isLoading: matchesLoading } = useQuery({
    queryKey: ["player-matches", playerId, matchPage],
    queryFn: () =>
      playerService.getMatches(playerId!, {
        skip: matchPage * MATCHES_PER_PAGE,
        limit: MATCHES_PER_PAGE,
      }),
    enabled: !!playerId,
  });

  // Fetch champion stats
  const { data: championStats, isLoading: championsLoading } = useQuery({
    queryKey: ["player-champions", playerId],
    queryFn: () => playerService.getChampionStats(playerId!),
    enabled: !!playerId,
  });

  // Fetch team history
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["player-teams", playerId],
    queryFn: () => playerService.getTeams(playerId!),
    enabled: !!playerId,
  });

  if (playerLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading player details...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Player not found</p>
          <Link to="/players">
            <Button variant="outline">
              <IconArrowLeft className="mr-2" size={18} />
              Back to Players
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const kdaData = [
    { name: "Kills", value: player.total_kills || 0 },
    { name: "Deaths", value: player.total_deaths || 0 },
    { name: "Assists", value: player.total_assists || 0 },
  ];

  const performanceData = [
    { name: "Wins", value: player.total_wins || 0 },
    {
      name: "Losses",
      value: (player.total_games || 0) - (player.total_wins || 0),
    },
  ];

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Back Button */}
      <Link to="/players">
        <Button variant="ghost" className="gap-2">
          <IconArrowLeft size={18} />
          Back to Players
        </Button>
      </Link>

      {/* Player Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {player.player_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{player.player_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {player.position && (
                      <Badge variant="outline">{player.position}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Games Played</p>
              <p className="text-2xl font-bold">{player.total_games || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-primary">
                {player.win_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">KDA</p>
              <p className="text-2xl font-bold text-primary">
                {player.avg_kda?.toFixed(2) || 0}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Wins</p>
              <p className="text-2xl font-bold text-green-500">
                {player.total_wins || 0}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Losses</p>
              <p className="text-2xl font-bold text-red-500">
                {(player.total_games || 0) - (player.total_wins || 0)}
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
              <IconChartBar size={20} />
              K/D/A Distribution
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
                      (entry.value / (player.total_games || 1)) *
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
      </div>

      {/* Champion Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield size={20} />
            Champion Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {championsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading champion stats...</p>
            </div>
          ) : championStats && championStats.length > 0 ? (
            <>
              <div className="overflow-x-auto mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Champion</TableHead>
                      <TableHead className="text-right">Games</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">KDA</TableHead>
                      <TableHead className="text-right">K/D/A</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {championStats.slice(0, 10).map((champ: ChampionStat) => (
                      <TableRow key={champ.champion}>
                        <TableCell className="font-medium">
                          {champ.champion}
                        </TableCell>
                        <TableCell className="text-right">
                          {champ.games_played}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          {champ.wins}
                        </TableCell>
                        <TableCell className="text-right">
                          {champ.win_rate?.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {champ.avg_kda?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {champ.avg_kills?.toFixed(1)}/
                          {champ.avg_deaths?.toFixed(1)}/
                          {champ.avg_assists?.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {championStats.length > 5 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={championStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="champion"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="games_played"
                      fill={CHART_COLORS.quaternary}
                      name="Games Played"
                    />
                    <Bar
                      dataKey="wins"
                      fill={CHART_COLORS.tertiary}
                      name="Wins"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No champion data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield size={20} />
            Team History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading team history...</p>
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team: TeamInfo) => (
                    <TableRow key={team.team_id}>
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
                      <TableCell className="text-right">
                        {team.win_rate?.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No team history available</p>
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
                {matchHistory.map((match: MatchInfo) => (
                  <div
                    key={match.match_id}
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
                          <span className="font-medium">{match.champion}</span>
                          <span className="text-muted-foreground">
                            {match.kills}/{match.deaths}/{match.assists}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {match.match_date && (
                            <span>
                              {new Date(match.match_date).toLocaleDateString()}
                            </span>
                          )}
                          {match.team_name && <span>{match.team_name}</span>}
                          <span>CS: {match.total_cs || 0}</span>
                          <span>
                            Gold: {match.totalgold?.toLocaleString() || 0}
                          </span>
                          <span>
                            DMG:{" "}
                            {match.damagetochampions?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                      <Link to={`/matches/${match.match_id}`}>
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
