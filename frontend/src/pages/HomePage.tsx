import { Link } from "react-router-dom";
import {
  IconChartBar,
  IconPlus,
  IconShield,
  IconSparkles,
  IconSwords,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardStats } from "../hooks/useAnalytics";

export default function HomePage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const quickActions = [
    {
      icon: IconTrophy,
      title: "Add Tournament",
      description: "Create a new tournament",
      link: "/tournaments",
    },
    {
      icon: IconShield,
      title: "Add Team",
      description: "Register a new team",
      link: "/teams",
    },
    {
      icon: IconUser,
      title: "Add Player",
      description: "Add a new player profile",
      link: "/players",
    },
    {
      icon: IconSwords,
      title: "Add Match",
      description: "Record match results",
      link: "/matches",
    },
    {
      icon: IconChartBar,
      title: "View Analytics",
      description: "Explore detailed statistics",
      link: "/analytics",
    },
    {
      icon: IconUsers,
      title: "Manage Users",
      description: "User administration",
      link: "/users",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <IconSparkles size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {user?.full_name || user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Manage your League of Legends esports data from your dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tournaments</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {stats?.total_tournaments.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconTrophy size={24} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matches</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {stats?.total_matches.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconSwords size={24} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teams</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {stats?.total_teams.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconShield size={24} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Players</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {stats?.total_players.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconUser size={24} className="text-primary" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <action.icon size={24} className="text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <IconPlus
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Tips */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <IconSparkles size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding your first tournament, teams, and players. Then record matches and
              explore the analytics to gain insights into player and team performance.
            </p>
            <div className="flex gap-3">
              <Link to="/tournaments">
                <Button size="sm">Create Tournament</Button>
              </Link>
              <Link to="/analytics">
                <Button size="sm" variant="outline">
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
