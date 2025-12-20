import {
  IconChartBar,
  IconClock,
  IconDeviceGamepad2,
  IconMail,
  IconShield,
  IconSparkles,
  IconSwords,
  IconTournament,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  const statCards = [
    {
      icon: IconTrophy,
      value: "0",
      label: "Tournaments",
      color: "text-amber-500",
    },
    { icon: IconSwords, value: "0", label: "Matches", color: "text-blue-500" },
    { icon: IconUsers, value: "0", label: "Teams", color: "text-green-500" },
    {
      icon: IconDeviceGamepad2,
      value: "0",
      label: "Players",
      color: "text-purple-500",
    },
  ];

  const features = [
    {
      icon: IconTournament,
      title: "Tournaments",
      description:
        "Create and manage esports tournaments, track schedules, and monitor progress",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: IconUsers,
      title: "Teams & Players",
      description:
        "Manage team rosters, player profiles, and track their performance",
      color: "text-green-500 bg-green-500/10",
    },
    {
      icon: IconSwords,
      title: "Matches",
      description:
        "Record match results, track statistics, and analyze game data",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: IconChartBar,
      title: "Analytics",
      description:
        "View detailed analytics, statistics, and performance insights",
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center">
            <IconSparkles size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {user?.full_name || user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Your comprehensive dashboard for managing League of Legends
              esports data
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}
                >
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-r from-primary to-accent flex items-center justify-center">
                <IconUser size={20} className="text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <IconUser size={18} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <IconMail size={18} className="text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <IconShield size={18} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <IconClock size={20} className="text-white" />
              </div>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <IconClock size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                No recent activity yet. Start by exploring the system and
                managing your esports data!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">Platform Features</CardTitle>
          <CardDescription>
            Explore the powerful features of the LoL Esports Analytics platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
