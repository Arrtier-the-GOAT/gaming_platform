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
import ChessGame from "./pages/games/Chess";
import TicTacToe from "./pages/games/TicTacToe";
import Connect4 from "./pages/games/Connect4";
import Sudoku from "./pages/games/Sudoku";
import Game2048 from "./pages/games/Game2048";
import Memory from "./pages/games/Memory";
import Snake from "./pages/games/Snake";
import FlappyBird from "./pages/games/FlappyBird";
import Breakout from "./pages/games/Breakout";
import PacMan from "./pages/games/PacMan";
import Minesweeper from "./pages/games/Minesweeper";
import PuzzleSlider from "./pages/games/PuzzleSlider";
import CardMemory from "./pages/games/CardMemory";
import WordSearch from "./pages/games/WordSearch";
import Crossword from "./pages/games/Crossword";
import Trivia from "./pages/games/Trivia";
import Hangman from "./pages/games/Hangman";
import Wordle from "./pages/games/Wordle";
import Checkers from "./pages/games/Checkers";
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
      <Route path={"/play/chess"} component={ChessGame} />
      <Route path={"/play/tic-tac-toe"} component={TicTacToe} />
      <Route path={"/play/connect-4"} component={Connect4} />
      <Route path={"/play/sudoku"} component={Sudoku} />
      <Route path={"/play/2048"} component={Game2048} />
      <Route path={"/play/memory-game"} component={Memory} />
      <Route path={"/play/snake-game"} component={Snake} />
      <Route path={"/play/flappy-bird-clone"} component={FlappyBird} />
      <Route path={"/play/breakout"} component={Breakout} />
      <Route path={"/play/pac-man-clone"} component={PacMan} />
      <Route path={"/play/minesweeper"} component={Minesweeper} />
      <Route path={"/play/puzzle-slider"} component={PuzzleSlider} />
      <Route path={"/play/card-memory"} component={CardMemory} />
      <Route path={"/play/word-search"} component={WordSearch} />
      <Route path={"/play/crossword"} component={Crossword} />
      <Route path={"/play/trivia-quiz"} component={Trivia} />
      <Route path={"/play/hangman"} component={Hangman} />
      <Route path={"/play/wordle-clone"} component={Wordle} />
      <Route path={"/play/checkers"} component={Checkers} />
      
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
      <ThemeProvider defaultTheme="light">
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
