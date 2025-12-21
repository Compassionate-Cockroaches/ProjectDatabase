import {
  IconChevronDown,
  IconDashboard,
  IconLogin,
  IconLogout,
  IconUserPlus,
  IconUsers,
  IconShield,
  IconUser,
  IconTrophy,
  IconSwords,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                LE
              </span>
            </div>
            <span className="hidden sm:inline">LoL Esports Analytics</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconDashboard size={18} />
                    <span className="hidden md:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link to="/users">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconUsers size={18} />
                    <span className="hidden md:inline">Users</span>
                  </Button>
                </Link>
                <Link to="/teams">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconShield size={18} />
                    <span className="hidden md:inline">Teams</span>
                  </Button>
                </Link>
                <Link to="/players">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconUser size={18} />
                    <span className="hidden md:inline">Players</span>
                  </Button>
                </Link>
                <Link to="/tournaments">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconTrophy size={18} />
                    <span className="hidden md:inline">Tournaments</span>
                  </Button>
                </Link>
                <Link to="/matches">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconSwords size={18} />
                    <span className="hidden md:inline">Matches</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 ml-2">
                      <div className="w-7 h-7 rounded-full bg-linear-to-r from-primary to-accent flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-foreground">
                          {user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:inline max-w-25 truncate">
                        {user?.username}
                      </span>
                      <IconChevronDown size={14} className="opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-accent flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {user?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {user?.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit mt-1">
                        {user?.role}
                      </Badge>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive gap-2"
                    >
                      <IconLogout size={16} />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <IconLogin size={18} />
                    <span>Sign in</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-2">
                    <IconUserPlus size={18} />
                    <span>Sign up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
