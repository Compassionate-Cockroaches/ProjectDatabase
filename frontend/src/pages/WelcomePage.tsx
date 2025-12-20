import {
  IconChartBar,
  IconLogin,
  IconSparkles,
  IconTrophy,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-r from-primary to-accent flex items-center justify-center shadow-lg">
              <IconSparkles size={40} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            LoL Esports Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
            Manage your League of Legends tournaments, teams, players, and
            matches all in one powerful platform
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <Card className="border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <IconUserPlus size={28} className="text-primary" />
                Get Started
              </CardTitle>
              <CardDescription className="text-base">
                Create an account to start managing your esports data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register">
                <Button className="w-full" size="lg">
                  <IconUserPlus size={20} className="mr-2" />
                  Sign up
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <IconLogin size={28} className="text-primary" />
                Already a member?
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full" size="lg">
                  <IconLogin size={20} className="mr-2" />
                  Sign in
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Card className="bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/10">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-md">
                <IconTrophy size={28} className="text-white" />
              </div>
              <CardTitle className="text-xl">Tournaments</CardTitle>
              <CardDescription className="text-base">
                Organize and track tournaments with comprehensive scheduling and
                monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/10">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 shadow-md">
                <IconUsers size={28} className="text-white" />
              </div>
              <CardTitle className="text-xl">Teams & Players</CardTitle>
              <CardDescription className="text-base">
                Manage team rosters, player profiles, and track performance
                metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/10">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-md">
                <IconChartBar size={28} className="text-white" />
              </div>
              <CardTitle className="text-xl">Analytics</CardTitle>
              <CardDescription className="text-base">
                Track performance with detailed statistics and insights
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
