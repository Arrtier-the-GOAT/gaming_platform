import { useState, type ReactNode } from "react";
import { Gamepad2, Menu, X, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { getLoginUrl } from "@/const";

export default function PublicClientLayout({ children }: { children?: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div className="">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Gamepad2 className="w-6 h-6 text-primary flex-shrink-0" />
            <span className="font-bold text-lg md:text-xl truncate">Gaming Hub</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {isAuthenticated && (
              <>
                <Link to="/games" className="text-sm hover:text-primary transition">
                  Games
                </Link>
                <Link to="/shop" className="text-sm hover:text-primary transition">
                  Shop
                </Link>
                <Link to="/leaderboard" className="text-sm hover:text-primary transition">
                  Leaderboard
                </Link>
                <Link to="/premium" className="text-sm hover:text-primary transition">
                  Premium
                </Link>
                <Link to="/events" className="text-sm hover:text-primary transition">
                  Events
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    {user?.name || "Profile"}
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin">
                    <Button size="sm" variant="secondary">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-accent rounded-lg transition flex-shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/98 px-4 py-4 space-y-3">
            {isAuthenticated && (
              <>
                <Link to="/games" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Games
                </Link>
                <Link to="/shop" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Shop
                </Link>
                <Link to="/leaderboard" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Leaderboard
                </Link>
                <Link to="/premium" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Premium
                </Link>
                <Link to="/events" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Events
                </Link>
                <Link to="/daily-tasks" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Daily Tasks
                </Link>
                <Link to="/achievements" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Achievements
                </Link>
                <hr className="my-2" />
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-medium">
                  Profile
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="block py-3 px-4 hover:bg-accent rounded-lg transition text-base font-semibold text-blue-600">
                    Admin Dashboard
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-2 h-10 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full h-10 text-base">
                Sign In
              </Button>
            )}
          </div>
        )}
      </nav>
      <main className="flex-1">{children ?? <Outlet />}</main>
    </div>
  );
}
