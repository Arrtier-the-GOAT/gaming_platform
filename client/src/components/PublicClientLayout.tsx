import { useCallback, useState, type ReactNode } from "react";
import { Gamepad2, Menu, X, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { getLoginUrl } from "@/const";

const MAIN_NAV_LINKS = [
  { to: "/games", label: "Games" },
  { to: "/shop", label: "Shop" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/premium", label: "Premium" },
  { to: "/events", label: "Events" },
];

const MOBILE_EXTRA_LINKS = [
  { to: "/daily-tasks", label: "Daily Tasks" },
  { to: "/achievements", label: "Achievements" },
];

export default function PublicClientLayout({ children }: { children?: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();
  const navigate = useNavigate();

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logoutMutation, navigate]);

  const getDesktopNavClassName = useCallback(({ isActive }: { isActive: boolean }) => `text-sm transition ${isActive ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"}`, []);

  const getMobileNavClassName = useCallback(
    ({ isActive }: { isActive: boolean }) => `block py-3 px-4 rounded-lg transition text-base font-medium ${isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`,
    []
  );

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
                {MAIN_NAV_LINKS.map(link => (
                  <NavLink key={link.to} to={link.to} className={getDesktopNavClassName}>
                    {link.label}
                  </NavLink>
                ))}
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
              <Button asChild size="sm">
                <Link to={getLoginUrl()}>Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition flex-shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/98 px-4 py-4 space-y-3">
            {isAuthenticated && (
              <>
                {MAIN_NAV_LINKS.map(link => (
                  <NavLink key={link.to} to={link.to} className={getMobileNavClassName} onClick={closeMobileMenu}>
                    {link.label}
                  </NavLink>
                ))}
                {MOBILE_EXTRA_LINKS.map(link => (
                  <NavLink key={link.to} to={link.to} className={getMobileNavClassName} onClick={closeMobileMenu}>
                    {link.label}
                  </NavLink>
                ))}
                <hr className="my-2" />
              </>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={getMobileNavClassName} onClick={closeMobileMenu}>
                  Profile
                </NavLink>
                {user?.role === "admin" && (
                  <NavLink to="/admin" className="block py-3 px-4 rounded-lg transition text-base font-semibold text-primary hover:bg-primary/5" onClick={closeMobileMenu}>
                    Admin Dashboard
                  </NavLink>
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
              <Button asChild className="w-full h-10 text-base" onClick={closeMobileMenu}>
                <Link to={getLoginUrl()}>Sign In</Link>
              </Button>
            )}
          </div>
        )}
      </nav>
      <main className="flex-1">{children ?? <Outlet />}</main>
    </div>
  );
}
