import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import UsersPage from "./pages/UsersPage";
import TeamsPage from "./pages/TeamsPage";
import PlayersPage from "./pages/PlayersPage";
import TournamentsPage from "./pages/TournamentsPage";
import MatchesPage from "./pages/MatchesPage";

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
            <Route path="players" element={<PlayersPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="matches" element={<MatchesPage />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
