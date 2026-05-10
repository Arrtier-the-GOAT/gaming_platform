import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import PremiumDashboard from "@/pages/PremiumDashboard";
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
import Games from "./pages/Games";
import AdminDashboard from "./pages/AdminDashboard";
import GameTutorials from "./pages/GameTutorials";
import Social from "./pages/Social";
import Analytics from "./pages/Analytics";
import AdminShop from "./pages/AdminShop";
import AdminPremium from "./pages/AdminPremium";
import AdminRewards from "./pages/AdminRewards";
import AdminAchievements from "./pages/AdminAchievements";
import AdminEvents from "./pages/AdminEvents";
import CandyCrush from '@/pages/games/CandyCrush';
import BubbleShooter from '@/pages/games/BubbleShooter';
import WordleClone from '@/pages/games/WordleClone';
import GoldMiner from '@/pages/games/GoldMiner';
import UnoCardGame from '@/pages/games/UnoCardGame';
import MemoryMatch from '@/pages/games/MemoryMatch';
import { PWAPrompt } from "./components/PWAPrompt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/premium-dashboard"} component={PremiumDashboard} />
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/premium"} component={Premium} />
      <Route path={"/events"} component={Events} />
      <Route path={"/daily-tasks"} component={DailyTasks} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/games"} component={Games} />
      
      {/* Game routes */}
      <Route path={"/play/candy-crush"} component={CandyCrush} />
      <Route path={"/play/bubble-shooter"} component={BubbleShooter} />
      <Route path={"/play/bubble-pop"} component={BubbleShooter} />
      <Route path={"/play/wordle-clone"} component={WordleClone} />
      <Route path={"/play/gold-miner"} component={GoldMiner} />
      <Route path={"/play/uno-card-game"} component={UnoCardGame} />
      <Route path={"/play/memory-match"} component={MemoryMatch} />
      
      {/* Admin routes */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/shop"} component={AdminShop} />
      <Route path={"/admin/premium"} component={AdminPremium} />
      <Route path={"/admin/rewards"} component={AdminRewards} />
      <Route path={"/admin/achievements"} component={AdminAchievements} />
      <Route path={"/tutorials"} component={GameTutorials} />
      <Route path={"/social"} component={Social} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PWAPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
