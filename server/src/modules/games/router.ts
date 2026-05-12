import { and, eq, gte } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { energyCoreTransactions, gameResults, leaderboardPoints, premiumSubscriptions, users } from "../../../migrations/schema";

export const gamesRouter = router({
  recordResult: protectedProcedure
    .input(
      z.object({
        gameName: z.string(),
        won: z.boolean(),
        points: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const energyCoreReward = input.won ? 5 : -2;
      let leaderboardPointsReward = input.won ? 2 : 0;

      if (input.won) {
        const premiumSub = await db
          .select()
          .from(premiumSubscriptions)
          .where(and(eq(premiumSubscriptions.userId, ctx.user.id), gte(premiumSubscriptions.expiresAt, new Date())))
          .limit(1);

        if (premiumSub.length > 0) {
          leaderboardPointsReward += 2;
        }
      }

      await db.insert(gameResults).values({
        userId: ctx.user.id,
        gameName: input.gameName,
        won: input.won,
        points: input.points,
        energyCoreEarned: energyCoreReward,
        leaderboardPointsEarned: leaderboardPointsReward,
      });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const newBalance = Math.max(0, (user[0]?.mykBalance || 0) + energyCoreReward);
      await db.update(users).set({ mykBalance: newBalance }).where(eq(users.id, ctx.user.id));

      await db.insert(energyCoreTransactions).values({
        userId: ctx.user.id,
        amount: energyCoreReward,
        type: input.won ? "game_win" : "game_loss",
        description: input.won ? `Won ${input.gameName}` : `Lost ${input.gameName} (-2 energy core)`,
      });

      const leaderboard = await db.select().from(leaderboardPoints).where(eq(leaderboardPoints.userId, ctx.user.id)).limit(1);
      if (leaderboard[0]) {
        const newTotalPoints = leaderboard[0].totalPoints + leaderboardPointsReward;
        await db
          .update(leaderboardPoints)
          .set({
            totalPoints: newTotalPoints,
            gamesWon: input.won ? leaderboard[0].gamesWon + 1 : leaderboard[0].gamesWon,
            lastUpdated: new Date(),
          })
          .where(eq(leaderboardPoints.userId, ctx.user.id));
      } else if (input.won) {
        await db.insert(leaderboardPoints).values({
          userId: ctx.user.id,
          totalPoints: leaderboardPointsReward,
          gamesWon: 1,
        });
      }

      return { success: true, resultId: 0, leaderboardPoints: leaderboardPointsReward };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const results = await db.select().from(gameResults).where(eq(gameResults.userId, ctx.user.id));
    const totalGames = results.length;
    const gamesWon = results.filter(r => r.won).length;
    const totalEarned = results.reduce((sum, r) => sum + r.energyCoreEarned, 0);

    return {
      totalGames,
      gamesWon,
      winRate: totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(2) : "0",
      totalEarned,
    };
  }),
});