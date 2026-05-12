import { router } from "./core/trpc/procedures";
import { systemRouter } from "./core/trpc/systemRouter";
import { achievementsRouter } from "./modules/achievements/router";
import { adminRouter } from "./modules/admin/router";
import { authRouter } from "./modules/auth/router";
import { dailyTasksRouter } from "./modules/daily-tasks/router";
import { energyCoreRouter } from "./modules/energy-core/router";
import { eventsRouter } from "./modules/events/router";
import { gamesRouter } from "./modules/games/router";
import { leaderboardRouter } from "./modules/leaderboard/router";
import { premiumRouter } from "./modules/premium/router";
import { referralRouter } from "./modules/referral/router";
import { rewardCodeRouter } from "./modules/reward-code/router";
import { setupRouter } from "./modules/setup/router";
import { shopRouter } from "./modules/shop/router";
import { userRouter } from "./modules/user/router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
  referral: referralRouter,
  energyCore: energyCoreRouter,
  shop: shopRouter,
  leaderboard: leaderboardRouter,
  premium: premiumRouter,
  dailyTask: dailyTasksRouter,
  achievement: achievementsRouter,
  event: eventsRouter,
  game: gamesRouter,
  setup: setupRouter,
  admin: adminRouter,
  rewardCode: rewardCodeRouter,
});

export type AppRouter = typeof appRouter;
