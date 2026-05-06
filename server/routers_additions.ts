// Add these routers to server/routers.ts

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { rewardCodes, weeklyLeaderboardSnapshots, leaderboardPoints, users } from "../drizzle/schema";
import { protectedProcedure, router } from "./_core/trpc";

// Helper function to generate unique reward code
function generateRewardCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

// Add to leaderboard router
export const leaderboardRewardCodeRouter = router({
  // Get top 3 players and generate reward codes
  generateWeeklyRewardCodes: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Only admin can generate codes
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const weekNumber = getCurrentWeekNumber();

      // Get top 3 players
      const topPlayers = await db.select().from(leaderboardPoints)
        .orderBy(desc(leaderboardPoints.totalPoints))
        .limit(3);

      if (topPlayers.length < 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough players for rewards",
        });
      }

      // Check if codes already generated for this week
      const existingSnapshot = await db.select().from(weeklyLeaderboardSnapshots)
        .where(eq(weeklyLeaderboardSnapshots.weekNumber, weekNumber)).limit(1);

      if (existingSnapshot.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reward codes already generated for this week",
        });
      }

      // Generate reward codes for top 3
      const rewardAmounts = [5000, 3000, 1000]; // MMK E amounts for 1st, 2nd, 3rd
      const generatedCodes = [];

      for (let i = 0; i < 3; i++) {
        const code = generateRewardCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

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

      // Save weekly snapshot
      await db.insert(weeklyLeaderboardSnapshots).values({
        weekNumber,
        userId1: topPlayers[0].userId,
        userId2: topPlayers[1].userId,
        userId3: topPlayers[2].userId,
        points1: topPlayers[0].totalPoints,
        points2: topPlayers[1].totalPoints,
        points3: topPlayers[2].totalPoints,
      });

      return { success: true, codes: generatedCodes };
    }),

  // Get all reward codes (admin only)
  getAllRewardCodes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const codes = await db.select().from(rewardCodes)
      .orderBy(desc(rewardCodes.createdAt));

    // Get user details for each code
    const codesWithUsers = await Promise.all(
      codes.map(async (code) => {
        const user = await db.select().from(users)
          .where(eq(users.id, code.userId)).limit(1);
        return {
          ...code,
          userName: user[0]?.name || "Unknown",
          userEmail: user[0]?.email,
        };
      })
    );

    return codesWithUsers;
  }),

  // Get user's reward codes
  getUserRewardCodes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const codes = await db.select().from(rewardCodes)
      .where(eq(rewardCodes.userId, ctx.user.id))
      .orderBy(desc(rewardCodes.createdAt));

    return codes;
  }),

  // Claim reward code
  claimRewardCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rewardCode = await db.select().from(rewardCodes)
        .where(eq(rewardCodes.code, input.code)).limit(1);

      if (!rewardCode[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid reward code" });
      }

      if (rewardCode[0].claimed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code already claimed" });
      }

      if (new Date() > rewardCode[0].expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code expired" });
      }

      if (rewardCode[0].userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This code is not for your account",
        });
      }

      // Mark as claimed
      await db.update(rewardCodes)
        .set({ claimed: true, claimedAt: new Date() })
        .where(eq(rewardCodes.id, rewardCode[0].id));

      return { success: true, amount: rewardCode[0].rewardAmount };
    }),

  // Reset leaderboard (admin only)
  resetWeeklyLeaderboard: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Reset all leaderboard points to 0
    const allPlayers = await db.select().from(leaderboardPoints);

    for (const player of allPlayers) {
      await db.update(leaderboardPoints)
        .set({ totalPoints: 0, gamesWon: 0, lastUpdated: new Date() })
        .where(eq(leaderboardPoints.userId, player.userId));
    }

    return { success: true, playersReset: allPlayers.length };
  }),
});
