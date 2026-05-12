import { and, desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { leaderboardPoints, leaderboardRewards, leaderboardSeasons, seasonalGameLeaderboardSnapshots, seasonalReferrerLeaderboardSnapshots, users } from "../../../migrations/schema";
import { getCurrentReferralWeekWindow, getReferralLeaderboardForWindow, getWeeklyReferralRewardHistory } from "../referral/service";

export const leaderboardRouter = router({
  getTopPlayers: publicProcedure.input(z.object({ limit: z.number().default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const leaderboard = await db.select().from(leaderboardPoints).orderBy(desc(leaderboardPoints.totalPoints)).limit(input.limit);

    const result = await Promise.all(
      leaderboard.map(async entry => {
        const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
        return {
          ...entry,
          userName: user[0]?.name || "Unknown",
          userEmail: user[0]?.email,
        };
      })
    );

    return result;
  }),

  getRewards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(leaderboardRewards).orderBy(leaderboardRewards.position);
  }),

  getUserRank: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const leaderboard = await db.select().from(leaderboardPoints).orderBy(desc(leaderboardPoints.totalPoints));

    const rank = leaderboard.findIndex(entry => entry.userId === ctx.user.id) + 1;
    const userEntry = leaderboard.find(entry => entry.userId === ctx.user.id);

    return {
      rank: rank || null,
      totalPoints: userEntry?.totalPoints || 0,
      gamesWon: userEntry?.gamesWon || 0,
    };
  }),

  getTopReferrers: publicProcedure.input(z.object({ limit: z.number().default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const currentWeek = getCurrentReferralWeekWindow();
    return getReferralLeaderboardForWindow(db, currentWeek, input.limit);
  }),

  getReferrerRank: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const currentWeek = getCurrentReferralWeekWindow();
    const referrerStats = await getReferralLeaderboardForWindow(db, currentWeek, 1000);
    const rank = referrerStats.findIndex(entry => entry.referrerId === ctx.user.id) + 1;
    const userEntry = referrerStats.find(entry => entry.referrerId === ctx.user.id);

    return {
      rank: rank || null,
      premiumUserCount: userEntry?.successfulReferralCount || 0,
      weekKey: currentWeek.weekKey,
      weekStartAt: currentWeek.start,
      weekEndAt: currentWeek.end,
    };
  }),

  getWeeklyRewardHistory: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return getWeeklyReferralRewardHistory(db, input.limit);
  }),

  getCurrentSeason: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const season = await db.select().from(leaderboardSeasons).where(eq(leaderboardSeasons.isActive, true)).limit(1);
    return season[0] || null;
  }),

  getAllSeasons: publicProcedure.input(z.object({ limit: z.number().default(50) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(leaderboardSeasons).orderBy(desc(leaderboardSeasons.seasonNumber)).limit(input.limit);
  }),

  getGameLeaderboardForSeason: publicProcedure.input(z.object({ seasonId: z.number(), limit: z.number().default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const snapshots = await db
      .select()
      .from(seasonalGameLeaderboardSnapshots)
      .where(eq(seasonalGameLeaderboardSnapshots.seasonId, input.seasonId))
      .orderBy(seasonalGameLeaderboardSnapshots.rank)
      .limit(input.limit);

    const result = await Promise.all(
      snapshots.map(async entry => {
        const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
        return {
          ...entry,
          userName: user[0]?.name || "Unknown",
          userEmail: user[0]?.email,
        };
      })
    );

    return result;
  }),

  getReferrerLeaderboardForSeason: publicProcedure.input(z.object({ seasonId: z.number(), limit: z.number().default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const snapshots = await db
      .select()
      .from(seasonalReferrerLeaderboardSnapshots)
      .where(eq(seasonalReferrerLeaderboardSnapshots.seasonId, input.seasonId))
      .orderBy(seasonalReferrerLeaderboardSnapshots.rank)
      .limit(input.limit);

    const result = await Promise.all(
      snapshots.map(async entry => {
        const referrer = await db.select().from(users).where(eq(users.id, entry.referrerId)).limit(1);
        return {
          ...entry,
          referrerName: referrer[0]?.name || "Unknown",
          referrerEmail: referrer[0]?.email,
        };
      })
    );

    return result;
  }),
});
