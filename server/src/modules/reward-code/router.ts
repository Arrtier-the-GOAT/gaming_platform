import { desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../core/database/connection";
import { leaderboardPoints, rewardCodes, users } from "../../../migrations/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const rewardCodeRouter = router({
  generateWeeklyRewardCodes: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const weekNumber = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
    const topPlayers = await db.select().from(leaderboardPoints).orderBy(desc(leaderboardPoints.totalPoints)).limit(3);

    if (topPlayers.length < 3) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough players for rewards" });
    }

    const rewardAmounts = [5000, 3000, 1000];
    const generatedCodes = [] as Array<{ position: number; code: string; userId: number; amount: number }>;

    for (let i = 0; i < 3; i++) {
      const code = Math.random().toString(36).substring(2, 14).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.insert(rewardCodes).values({
        code,
        userId: topPlayers[i].userId,
        leaderboardPosition: i + 1,
        weekNumber,
        rewardAmount: rewardAmounts[i],
        expiresAt,
      });

      generatedCodes.push({
        position: i + 1,
        code,
        userId: topPlayers[i].userId,
        amount: rewardAmounts[i],
      });
    }

    return { success: true, codes: generatedCodes };
  }),

  getUserRewardCodes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(rewardCodes).where(eq(rewardCodes.userId, ctx.user.id)).orderBy(desc(rewardCodes.createdAt));
  }),
});