import { and, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { achievements, energyCoreTransactions, userAchievements, users } from "../../../migrations/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const achievementsRouter = router({
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(achievements);
  }),

  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(userAchievements).where(eq(userAchievements.userId, ctx.user.id));
  }),

  claimReward: protectedProcedure.input(z.object({ achievementId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userAchievement = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, ctx.user.id), eq(userAchievements.achievementId, input.achievementId)))
      .limit(1);

    if (!userAchievement[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
    }

    if (userAchievement[0].rewardClaimed) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Reward already claimed" });
    }

    const achievement = await db.select().from(achievements).where(eq(achievements.id, input.achievementId)).limit(1);
    if (!achievement[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
    }

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    await db
      .update(users)
      .set({ mykBalance: (user[0]?.mykBalance || 0) + achievement[0].energyCoreReward })
      .where(eq(users.id, ctx.user.id));

    await db.insert(energyCoreTransactions).values({
      userId: ctx.user.id,
      amount: achievement[0].energyCoreReward,
      type: "achievement",
      description: `Achievement reward: ${achievement[0].name}`,
    });

    await db.update(userAchievements).set({ rewardClaimed: true }).where(eq(userAchievements.id, userAchievement[0].id));

    return { success: true, rewardAmount: achievement[0].energyCoreReward };
  }),

  createAchievement: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        energyCoreReward: z.number(),
        type: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(achievements).values({
        name: input.name,
        description: input.description,
        energyCoreReward: input.energyCoreReward,
        type: input.type,
      });

      return { success: true, achievementId: 0 };
    }),

  updateAchievement: adminProcedure
    .input(
      z.object({
        id: z.number(),
        energyCoreReward: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(achievements)
        .set({
          energyCoreReward: input.energyCoreReward,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(achievements.id, input.id));

      return { success: true };
    }),
});