import { useState } from "react";
import {
  usePlayerLeaderboard,
  useTeamLeaderboard,
  useDashboardStats,
} from "../hooks/useAnalytics";
import type { PlayerMetric, AnalyticsFilters } from "../types/analytics";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
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
  LineChart,
  Line,
} from "recharts";

// Using chart colors from theme (chart-1 through chart-5)
const CHART_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
};

export default function AnalyticsPage() {
  // State for filters
  const [playerMetric, setPlayerMetric] = useState<PlayerMetric>("kda");
  const [filters, setFilters] = useState<AnalyticsFilters>({
    limit: 10,
    min_games: 5,
    min_matches: 5,
  });

  // Queries
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  const { data: playerLeaderboard, isLoading: playerLoading } = usePlayerLeaderboard(
    playerMetric,
    filters
  );
  const { data: teamLeaderboard, isLoading: teamLoading } = useTeamLeaderboard(filters);

  // Filter handlers
  const handleFilterChange = (key: keyof AnalyticsFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      limit: 10,
      min_games: 5,
      min_matches: 5,
    });
  };

  // Prepare chart data for player metrics
  const playerChartData = playerLeaderboard?.slice(0, 10).map((player) => ({
    name: player.player_name,
    [playerMetric]: player.metric_value,
    KDA: player.kda,
    DPM: player.avg_dpm,
    "Win Rate": player.win_rate,
  }));

  // Prepare chart data for team win rates
  const teamChartData = teamLeaderboard?.slice(0, 8).map((team) => ({
    name: team.team_name,
    "Win Rate": team.win_rate,
    Wins: team.wins,
    Losses: team.losses,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive statistics, leaderboards, and visualizations
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboardLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-24 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_teams.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Players</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_players.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Tournaments</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_tournaments.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_matches.toLocaleString()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2024"
              value={filters.year || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange("year", e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <Input
              id="league"
              placeholder="e.g., LCK"
              value={filters.league || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("league", e.target.value || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="split">Split</Label>
            <Select
              value={filters.split || ""}
              onValueChange={(value: string) => handleFilterChange("split", value || undefined)}
            >
              <SelectTrigger id="split">
                <SelectValue placeholder="Select split" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
                <SelectItem value="Winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select
              value={filters.position || ""}
              onValueChange={(value: string) => handleFilterChange("position", value || undefined)}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top">Top</SelectItem>
                <SelectItem value="Jungle">Jungle</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="ADC">ADC</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="playoffs">Playoffs</Label>
            <Select
              value={filters.playoffs?.toString() || ""}
              onValueChange={(value: string) =>
                handleFilterChange("playoffs", value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger id="playoffs">
                <SelectValue placeholder="All games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Playoffs Only</SelectItem>
                <SelectItem value="0">Regular Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Results Limit</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="100"
              value={filters.limit || 10}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange("limit", e.target.value ? parseInt(e.target.value) : 10)
              }
            />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Player Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Player Leaderboard</h2>
          <Select
            value={playerMetric}
            onValueChange={(value: string) => setPlayerMetric(value as PlayerMetric)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kda">KDA</SelectItem>
              <SelectItem value="dpm">Damage Per Minute</SelectItem>
              <SelectItem value="cspm">CS Per Minute</SelectItem>
              <SelectItem value="vision">Vision Score</SelectItem>
              <SelectItem value="winrate">Win Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {playerLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading player stats...</p>
          </div>
        ) : playerLeaderboard && playerLeaderboard.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">KDA</TableHead>
                    <TableHead className="text-right">DPM</TableHead>
                    <TableHead className="text-right">CSPM</TableHead>
                    <TableHead className="text-right">Vision</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerLeaderboard.map((player, idx) => (
                    <TableRow key={player.player_id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{player.player_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{player.games_played}</TableCell>
                      <TableCell className="text-right font-semibold">{player.kda}</TableCell>
                      <TableCell className="text-right">{player.avg_dpm}</TableCell>
                      <TableCell className="text-right">{player.avg_cspm}</TableCell>
                      <TableCell className="text-right">{player.avg_vision}</TableCell>
                      <TableCell className="text-right">{player.win_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Player Chart */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Top 10 Players Visualization</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={playerMetric} fill={CHART_COLORS.quaternary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Multi-metric comparison */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Multi-Metric Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={playerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="KDA" stroke={CHART_COLORS.quaternary} />
                  <Line type="monotone" dataKey="Win Rate" stroke={CHART_COLORS.tertiary} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <p>No player data available for the current filters.</p>
            <p className="text-sm mt-2">Try adjusting your filters or resetting them.</p>
          </div>
        )}
      </Card>

      {/* Team Leaderboard */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Team Leaderboard</h2>

        {teamLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading team stats...</p>
          </div>
        ) : teamLeaderboard && teamLeaderboard.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Matches</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Losses</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamLeaderboard.map((team, idx) => (
                    <TableRow key={team.team_id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{team.team_name}</TableCell>
                      <TableCell className="text-right">{team.matches_played}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {team.wins}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{team.losses}</TableCell>
                      <TableCell className="text-right font-bold">{team.win_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Team Win Rate Bar Chart */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Team Win Rate Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Win Rate" fill={CHART_COLORS.tertiary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Win/Loss Pie Chart */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Win/Loss Distribution (Top Team)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Wins", value: teamLeaderboard[0]?.wins || 0 },
                        { name: "Losses", value: teamLeaderboard[0]?.losses || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
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
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Wins vs Losses</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={teamChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Wins" fill={CHART_COLORS.tertiary} />
                    <Bar dataKey="Losses" fill={CHART_COLORS.quinary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <p>No team data available for the current filters.</p>
            <p className="text-sm mt-2">Try adjusting your filters or resetting them.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
