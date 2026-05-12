import { and, desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import {
  energyCoreTransactions,
  paymentTransactions,
  premiumSubscriptions,
  referrals,
  rewardCodes,
  shopItems,
  users,
  leaderboardPoints,
} from "../../../migrations/schema";
import { ensureReferralSystemSchema, markReferralPremiumActivated, runWeeklyReferralSettlement } from "../referral/service";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  getDashboard: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const totalUsers = await db.select().from(users);
    const premiumUsers = totalUsers.filter(u => u.isPremium);
    const totalTransactions = await db.select().from(energyCoreTransactions);

    return {
      totalUsers: totalUsers.length,
      premiumUsers: premiumUsers.length,
      totalTransactions: totalTransactions.length,
      totalEnergyDistributed: totalTransactions.reduce((sum, t) => sum + t.amount, 0),
    };
  }),

  getUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(users).orderBy(desc(users.createdAt));
  }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  adjustEnergyCore: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const newBalance = (user[0].mykBalance || 0) + input.amount;
      await db.update(users).set({ mykBalance: newBalance }).where(eq(users.id, input.userId));
      await db.insert(energyCoreTransactions).values({
        userId: input.userId,
        amount: input.amount,
        type: "admin_adjustment",
        description: input.reason,
      });

      return { success: true, newBalance };
    }),

  getPendingPremiumRequests: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const pendingRequests = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, "pending"))
      .orderBy(desc(paymentTransactions.createdAt));

    const enriched = await Promise.all(
      pendingRequests.map(async req => {
        const user = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
        return {
          ...req,
          userName: user[0]?.name || "Unknown",
          userEmail: user[0]?.email || "Unknown",
          finalAmount: req.amount,
        };
      })
    );

    return enriched;
  }),

  approvePremiumRequest: adminProcedure
    .input(
      z.object({
        paymentTransactionId: z.number(),
        durationMonths: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await ensureReferralSystemSchema(db);

      const paymentTx = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, input.paymentTransactionId)).limit(1);
      if (!paymentTx[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment transaction not found" });
      }

      if (paymentTx[0].status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request already processed" });
      }

      await db.update(paymentTransactions).set({ status: "completed" }).where(eq(paymentTransactions.id, input.paymentTransactionId));

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (paymentTx[0].durationMonths || input.durationMonths));

      await db.insert(premiumSubscriptions).values({
        userId: paymentTx[0].userId,
        durationMonths: paymentTx[0].durationMonths || input.durationMonths,
        priceMMK: paymentTx[0].amount,
        expiresAt,
      });

      await db.update(users).set({ isPremium: true, premiumExpiresAt: expiresAt }).where(eq(users.id, paymentTx[0].userId));

      if (paymentTx[0].referralId) {
        await db
          .update(referrals)
          .set({ discountApplied: true, discountAmount: paymentTx[0].discountAmount || 0 })
          .where(eq(referrals.id, paymentTx[0].referralId));
      }

      await markReferralPremiumActivated(db, paymentTx[0].userId, new Date());
      return { success: true, expiresAt };
    }),

  processWeeklyReferralRewards: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return runWeeklyReferralSettlement(db, new Date());
  }),

  rejectPremiumRequest: adminProcedure
    .input(z.object({ paymentTransactionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(paymentTransactions).set({ status: "failed" }).where(eq(paymentTransactions.id, input.paymentTransactionId));
      return { success: true };
    }),

  getShopItems: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(shopItems).orderBy(desc(shopItems.createdAt));
  }),

  createShopItem: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        energyCorePrice: z.number(),
        game: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(shopItems).values({
        name: input.name,
        description: input.description,
        energyCorePrice: input.energyCorePrice,
        game: input.game,
        category: input.category,
      });

      return { success: true };
    }),

  updateShopItem: adminProcedure
    .input(
      z.object({
        itemId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        energyCorePrice: z.number().optional(),
        game: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.energyCorePrice !== undefined) updateData.energyCorePrice = input.energyCorePrice;
      if (input.game !== undefined) updateData.game = input.game;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await db.update(shopItems).set(updateData).where(eq(shopItems.id, input.itemId));
      return { success: true };
    }),

  deleteShopItem: adminProcedure.input(z.object({ itemId: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db.delete(shopItems).where(eq(shopItems.id, input.itemId));
    return { success: true };
  }),
});