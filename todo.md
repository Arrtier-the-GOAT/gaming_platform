# Gaming Platform - Project TODO

## Core Features
- [x] User authentication (sign up, login, logout)
- [x] Referral system with referral codes
- [x] Energy core currency system (initial 100, referral bonus 200)
- [x] User profile management (email, phone, account settings)
- [x] Light/Dark mode theme toggle

## Database Schema
- [x] Users table (email, phone, role, referral code, energy core balance)
- [x] Referral table (referrer, referee, bonus tracking)
- [x] Energy core transactions table
- [x] Premium subscriptions table
- [x] Shop items table
- [x] User shop purchases/redemptions
- [x] Leaderboard points table
- [x] Daily tasks table
- [x] User daily task progress
- [x] Achievements table
- [x] User achievements table
- [x] Events table
- [x] Game scores/results table

## Shop & Currency
- [ ] Shop page with game currency items (MLBB Diamond, PUBG UC, Telegram Premium, HOK, Arena Breakout)
- [ ] Energy core purchase system
- [ ] Admin shop management (add/edit/remove items, set prices)
- [ ] User redemption form (Game ID, In-game name, Server ID for MLBB)
- [ ] Payment integration (KBZ Pay, AyaPay, UAB Pay)

## Premium System
- [ ] Premium subscription plans (1 month: 10,000 MMK, 3 months: 30,000 MMK, 5 months: 49,000 MMK)
- [ ] Premium benefits display
- [ ] Admin premium price management
- [ ] Premium user benefits (2x rewards on leaderboard, special achievements)
- [x] Premium user bonus leaderboard points (+2 bonus per win, total 4 points)
- [ ] Premium user dashboard with reward code section
- [x] Premium-only reward code eligibility check
- [ ] Premium user UI for viewing earned reward codes

## Leaderboard & Rewards
- [ ] Leaderboard page showing top players
- [ ] Leaderboard points system (2 points per game win)
- [ ] Top 3 rewards display (MMK E currency)
- [ ] Admin reward management (edit reward amounts)
- [ ] Premium user reward multiplier (2x for top 3)
- [ ] Weekly leaderboard reset (every 7 days)
- [x] Reward code generation for top 3 players (PREMIUM ONLY)
- [x] Premium user check before code generation
- [ ] Unique reward code per player (sent to their account)
- [ ] Admin panel showing all top 3 reward codes
- [ ] Reward code validation and redemption

## Daily Tasks & Events
- [ ] Daily tasks system (energy core rewards: 10, 20, 30, 40, 50, 60, 70 for days 1-7)
- [ ] Daily task progress tracking
- [ ] Events announcement page
- [ ] Admin event management (create/edit/delete events)
- [ ] Event notifications to all users

## Achievements
- [ ] Achievement system with game-related achievements
- [ ] Achievement rewards (energy core, premium bonuses)
- [ ] Premium purchase achievement (100 energy core reward)
- [ ] Admin achievement management (edit rewards)
- [ ] User achievement tracking

## Games (20 total)
- [x] UNO multiplayer (4 players)
- [x] Chess
- [x] Checkers
- [x] Tic Tac Toe
- [x] Connect 4
- [x] Sudoku
- [x] 2048
- [x] Memory/Matching Game
- [x] Word Search
- [x] Crossword
- [x] Trivia Quiz
- [x] Hangman
- [x] Wordle Clone
- [x] Snake Game
- [x] Flappy Bird Clone
- [x] Breakout/Brick Breaker
- [x] Pac-Man Clone
- [x] Minesweeper
- [x] Puzzle Slider
- [x] Card Memory Matching
- [ ] Game 2: (TBD)
- [ ] Game 3: (TBD)
- [ ] Game 4: (TBD)
- [ ] Game 5: (TBD)
- [ ] Game 6: (TBD)
- [ ] Game 7: (TBD)
- [ ] Game 8: (TBD)
- [ ] Game 9: (TBD)
- [ ] Game 10: (TBD)
- [ ] Game 11: (TBD)
- [ ] Game 12: (TBD)
- [ ] Game 13: (TBD)
- [ ] Game 14: (TBD)
- [ ] Game 15: (TBD)
- [ ] Game 16: (TBD)
- [ ] Game 17: (TBD)
- [ ] Game 18: (TBD)
- [ ] Game 19: (TBD)
- [ ] Game 20: (TBD)
- [x] Game win tracking and energy core rewards (5 energy core + 2 leaderboard points)
- [ ] Game loss penalty (2 energy core deducted)
- [ ] Mobile-responsive game UI
- [ ] Desktop game support

## Admin Panel
- [ ] Admin dashboard
- [ ] User management
- [ ] Shop item management (CRUD operations)
- [ ] Premium pricing management
- [ ] Reward amount management
- [ ] Achievement management
- [ ] Event management
- [ ] Energy core pricing management
- [ ] Leaderboard management

## Frontend Pages
- [x] Home page with leaderboard preview
- [x] Login/Signup page
- [x] User profile page (stub)
- [x] Shop page (functional)
- [x] Leaderboard page (functional)
- [x] Premium subscription page (stub)
- [x] Events page (stub)
- [x] Daily tasks page (functional)
- [x] Achievements page (stub)
- [x] Premium Dashboard (functional)
- [x] Game lobby/selection page (stub)
- [ ] Individual game pages (20 games)
- [x] Admin dashboard (stub)
- [x] Admin shop management (stub)
- [x] Admin premium pricing (stub)
- [x] Admin rewards management (stub)
- [x] Admin achievements management (stub)
- [x] Admin events management (stub)

## Mobile Responsiveness
- [ ] Mobile-friendly navigation
- [ ] Touch-optimized game controls
- [ ] Responsive layouts for all pages
- [ ] Mobile game performance optimization

## Testing & Polish
- [ ] Backend API testing (vitest)
- [ ] Frontend component testing
- [ ] Cross-browser testing
- [ ] Mobile device testing (iOS, Android)
- [ ] Payment flow testing
- [ ] Error handling and user feedback
- [ ] Loading states and animations

## Deployment
- [ ] Environment variable configuration
- [ ] Database migration setup
- [ ] Payment gateway configuration
- [ ] Admin account creation
- [ ] Final checkpoint before publishing
