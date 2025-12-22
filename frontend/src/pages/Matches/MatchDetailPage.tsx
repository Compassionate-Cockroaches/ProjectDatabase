import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconTrophy,
  IconUsers,
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
import { matchService } from "@/services/matchServices";

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();

  // Fetch match details
  const { data: matchDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["match-details", matchId],
    queryFn: () => matchService.getDetails(matchId!),
    enabled: !!matchId,
  });

  // Fetch player stats
  const { data: playerStats, isLoading: statsLoading } = useQuery({
    queryKey: ["match-player-stats", matchId],
    queryFn: () => matchService.getPlayerStats(matchId!),
    enabled: !!matchId,
  });

  if (detailsLoading || statsLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!matchDetails || !playerStats) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/matches">
            <Button variant="outline">
              <IconArrowLeft className="mr-2" size={18} />
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { match, tournament, teams } = matchDetails;

  // Separate players by team
  const teamMap: Record<string, any[]> = {};
  playerStats.forEach((player: any) => {
    if (!teamMap[player.team_id]) {
      teamMap[player.team_id] = [];
    }
    teamMap[player.team_id].push(player);
  });

  // Calculate team totals
  const teamTotals: Record<string, any> = {};
  Object.keys(teamMap).forEach((teamId) => {
    const players = teamMap[teamId];
    teamTotals[teamId] = {
      kills: players.reduce((sum, p) => sum + (p.kills || 0), 0),
      deaths: players.reduce((sum, p) => sum + (p.deaths || 0), 0),
      assists: players.reduce((sum, p) => sum + (p.assists || 0), 0),
      gold: players.reduce((sum, p) => sum + (p.totalgold || 0), 0),
      damage: players.reduce((sum, p) => sum + (p.damagetochampions || 0), 0),
      vision: players.reduce((sum, p) => sum + (p.visionscore || 0), 0),
    };
  });

  const winningTeam = teams.find((t: any) => t.result === true);
  const losingTeam = teams.find((t: any) => t.result === false);

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Back Button */}
      <Link to="/matches">
        <Button variant="ghost" className="gap-2">
          <IconArrowLeft size={18} />
          Back to Matches
        </Button>
      </Link>

      {/* Match Header Card */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconTrophy size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {tournament?.league || "Unknown League"} {tournament?.year}{" "}
                    {tournament?.split}
                  </span>
                </div>
                <h1 className="text-3xl font-bold">Match Details</h1>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-base">
                  Patch {match.patch || "Unknown"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <IconCalendar size={18} className="text-muted-foreground" />
                <span className="text-sm">
                  {match.match_date
                    ? new Date(match.match_date).toLocaleDateString()
                    : "Unknown Date"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconClock size={18} className="text-muted-foreground" />
                <span className="text-sm">
                  Duration:{" "}
                  {match.game_length
                    ? `${Math.floor(match.game_length / 60)}m ${match.game_length % 60}s`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Game {match.game_number || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Team Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers size={20} />
            Match Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {teams.map((team: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 ${
                  team.result
                    ? "border-green-500 bg-green-500/10"
                    : "border-red-500 bg-red-500/10"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{team.team_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={team.result ? "default" : "destructive"}>
                        {team.result ? "Victory" : "Defeat"}
                      </Badge>
                      <Badge variant="outline">{team.side} Side</Badge>
                    </div>
                  </div>
                </div>
                {teamTotals[team.team_id] && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Kills</p>
                      <p className="text-2xl font-bold">
                        {teamTotals[team.team_id].kills}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gold</p>
                      <p className="text-lg font-semibold">
                        {(teamTotals[team.team_id].gold / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Damage</p>
                      <p className="text-lg font-semibold">
                        {(teamTotals[team.team_id].damage / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Performance Tables */}
      {teams.map((team: any, teamIdx: number) => (
        <Card key={teamIdx}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {team.team_name}
                <Badge variant={team.result ? "default" : "destructive"}>
                  {team.result ? "Win" : "Loss"}
                </Badge>
              </CardTitle>
              <Badge variant="outline">{team.side} Side</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {teamMap[team.team_id] && teamMap[team.team_id].length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Champion</TableHead>
                      <TableHead className="text-right">K/D/A</TableHead>
                      <TableHead className="text-right">CS</TableHead>
                      <TableHead className="text-right">Gold</TableHead>
                      <TableHead className="text-right">Damage</TableHead>
                      <TableHead className="text-right">Vision</TableHead>
                      <TableHead className="text-right">KP%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMap[team.team_id].map((player: any) => {
                      const totalKills = teamTotals[team.team_id].kills;
                      const killParticipation =
                        totalKills > 0
                          ? (((player.kills || 0) + (player.assists || 0)) /
                              totalKills) *
                            100
                          : 0;

                      return (
                        <TableRow key={player.player_id}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/players/${player.player_id}`}
                              className="hover:text-primary hover:underline transition-colors"
                            >
                              {player.player_name}
                            </Link>
                          </TableCell>
                          <TableCell>{player.champion || "-"}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold">
                              {player.kills || 0}/{player.deaths || 0}/
                              {player.assists || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {player.total_cs || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {((player.totalgold || 0) / 1000).toFixed(1)}k
                          </TableCell>
                          <TableCell className="text-right">
                            {((player.damagetochampions || 0) / 1000).toFixed(
                              1,
                            )}
                            k
                          </TableCell>
                          <TableCell className="text-right">
                            {player.visionscore || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {killParticipation.toFixed(0)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No player data available
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Team Stats Comparison */}
      {winningTeam && losingTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Team Stats Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <p className="font-semibold">{winningTeam.team_name}</p>
                </div>
                <div className="text-center text-muted-foreground text-sm">
                  VS
                </div>
                <div>
                  <p className="font-semibold">{losingTeam.team_name}</p>
                </div>
              </div>

              {/* Total Kills */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">
                    {teamTotals[winningTeam.team_id]?.kills || 0}
                  </p>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Kills
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {teamTotals[losingTeam.team_id]?.kills || 0}
                  </p>
                </div>
              </div>

              {/* Total Gold */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <p className="text-xl font-semibold">
                    {(
                      (teamTotals[winningTeam.team_id]?.gold || 0) / 1000
                    ).toFixed(1)}
                    k
                  </p>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Gold
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {(
                      (teamTotals[losingTeam.team_id]?.gold || 0) / 1000
                    ).toFixed(1)}
                    k
                  </p>
                </div>
              </div>

              {/* Total Damage */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <p className="text-xl font-semibold">
                    {(
                      (teamTotals[winningTeam.team_id]?.damage || 0) / 1000
                    ).toFixed(1)}
                    k
                  </p>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Damage
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {(
                      (teamTotals[losingTeam.team_id]?.damage || 0) / 1000
                    ).toFixed(1)}
                    k
                  </p>
                </div>
              </div>

              {/* Vision Score */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <p className="text-xl font-semibold">
                    {teamTotals[winningTeam.team_id]?.vision || 0}
                  </p>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Vision Score
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {teamTotals[losingTeam.team_id]?.vision || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
