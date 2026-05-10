import PremiumDashboard from "@/pages/PremiumDashboard";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Shop from "@/pages/Shop";
import Leaderboard from "@/pages/Leaderboard";
import Premium from "@/pages/Premium";
import Events from "@/pages/Events";
import DailyTasks from "@/pages/DailyTasks";
import Achievements from "@/pages/Achievements";
import Games from "@/pages/Games";
import GameTutorials from "@/pages/GameTutorials";
import Social from "@/pages/Social";
import Analytics from "@/pages/Analytics";
import CandyCrush from "@/pages/games/CandyCrush";
import BubbleShooter from "@/pages/games/BubbleShooter";
import WordleClone from "@/pages/games/WordleClone";
import GoldMiner from "@/pages/games/GoldMiner";
import UnoCardGame from "@/pages/games/UnoCardGame";
import MemoryMatch from "@/pages/games/MemoryMatch";

export const publicRoutes = [
  { path: "/", component: Home },
  { path: "/premium-dashboard", component: PremiumDashboard },
  { path: "/profile", component: Profile },
  { path: "/shop", component: Shop },
  { path: "/leaderboard", component: Leaderboard },
  { path: "/premium", component: Premium },
  { path: "/events", component: Events },
  { path: "/daily-tasks", component: DailyTasks },
  { path: "/achievements", component: Achievements },
  { path: "/games", component: Games },
  { path: "/play/candy-crush", component: CandyCrush },
  { path: "/play/bubble-shooter", component: BubbleShooter },
  { path: "/play/bubble-pop", component: BubbleShooter },
  { path: "/play/wordle-clone", component: WordleClone },
  { path: "/play/gold-miner", component: GoldMiner },
  { path: "/play/uno-card-game", component: UnoCardGame },
  { path: "/play/memory-match", component: MemoryMatch },
  { path: "/tutorials", component: GameTutorials },
  { path: "/social", component: Social },
  { path: "/analytics", component: Analytics },
] as const;
