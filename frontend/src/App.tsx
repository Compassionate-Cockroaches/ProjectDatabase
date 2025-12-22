import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import WelcomePage from "@/pages/WelcomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import UsersPage from "@/pages/Users/UsersPage";
import TeamsPage from "@/pages/Teams/TeamsPage";
import PlayersPage from "@/pages/Players/PlayersPage";
import TournamentsPage from "@/pages/Tournaments/TournamentsPage";
import MatchesPage from "@/pages/Matches/MatchesPage";
import AnalyticsPage from "@/pages/Analytics/AnalyticsPage";
import TeamDetailPage from "@/pages/Teams/TeamDetailPage";
import PlayerDetailPage from "@/pages/Players/PlayerDetailPage";
import MatchDetailPage from "@/pages/Matches/MatchDetailPage";
import TournamentDetailPage from "@/pages/Tournaments/TournamentDetailPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:teamId" element={<TeamDetailPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="players/:playerId" element={<PlayerDetailPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route
              path="tournaments/:tournamentId"
              element={<TournamentDetailPage />}
            />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="matches/:matchId" element={<MatchDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
