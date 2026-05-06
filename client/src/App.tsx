import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Premium from "./pages/Premium";
import Events from "./pages/Events";
import DailyTasks from "./pages/DailyTasks";
import Achievements from "./pages/Achievements";
import GameLobby from "./pages/GameLobby";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShop from "./pages/AdminShop";
import AdminPremium from "./pages/AdminPremium";
import AdminRewards from "./pages/AdminRewards";
import AdminAchievements from "./pages/AdminAchievements";
import AdminEvents from "./pages/AdminEvents";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/premium"} component={Premium} />
      <Route path={"/events"} component={Events} />
      <Route path={"/daily-tasks"} component={DailyTasks} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/games"} component={GameLobby} />
      
      {/* Admin routes */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/shop"} component={AdminShop} />
      <Route path={"/admin/premium"} component={AdminPremium} />
      <Route path={"/admin/rewards"} component={AdminRewards} />
      <Route path={"/admin/achievements"} component={AdminAchievements} />
      <Route path={"/admin/events"} component={AdminEvents} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
