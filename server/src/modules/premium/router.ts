import { and, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { paymentTransactions, premiumSubscriptions, referrals, users } from "../../../migrations/schema";
import { ensureReferralSystemSchema, getPremiumPlanQuote } from "../referral/service";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const premiumRouter = router({
  getPlans: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(premiumSubscriptions).orderBy(premiumSubscriptions.durationMonths);
  }),

  getUserStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return {
      isPremium: user[0]?.isPremium || false,
      expiresAt: user[0]?.premiumExpiresAt,
    };
  }),

  purchasePremium: protectedProcedure
    .input(
      z.object({
        durationMonths: z.number(),
        paymentMethod: z.enum(["kbz_pay", "aya_pay", "uab_pay"]),
        transactionId: z.string().regex(/^\d{5}$/, "Transaction ID must be exactly 5 digits"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await ensureReferralSystemSchema(db);

      if (!/^\d{5}$/.test(input.transactionId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid transaction ID format" });
      }

      const [pendingRequest] = await db
        .select()
        .from(paymentTransactions)
        .where(and(eq(paymentTransactions.userId, ctx.user.id), eq(paymentTransactions.type, "premium"), eq(paymentTransactions.status, "pending")))
        .limit(1);

      if (pendingRequest) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You already have a pending premium request" });
      }

      const quote = await getPremiumPlanQuote(db, ctx.user.id, input.durationMonths);
      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
      }

      await db.insert(paymentTransactions).values({
        userId: ctx.user.id,
        amount: quote.finalPrice,
        originalAmount: quote.basePrice,
        discountAmount: quote.discountAmount,
        type: "premium",
        paymentMethod: input.paymentMethod,
        status: "pending",
        durationMonths: input.durationMonths,
        transactionId: input.transactionId,
        referralId: quote.referral?.id ?? null,
      });

      return {
        success: true,
        message: "Payment request submitted. Waiting for admin approval.",
        transactionId: input.transactionId,
        amount: quote.finalPrice,
        originalAmount: quote.basePrice,
        discountAmount: quote.discountAmount,
        hasReferralDiscount: quote.hasReferralDiscount,
        durationMonths: input.durationMonths,
      };
    }),

  updatePremiumPrice: adminProcedure
    .input(
      z.object({
        durationMonths: z.number(),
        priceMMK: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db.select().from(premiumSubscriptions).where(eq(premiumSubscriptions.durationMonths, input.durationMonths)).limit(1);

      if (existing[0]) {
        await db
          .update(premiumSubscriptions)
          .set({ priceMMK: input.priceMMK, updatedAt: new Date() })
          .where(eq(premiumSubscriptions.durationMonths, input.durationMonths));
      } else {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.insert(premiumSubscriptions).values({
          userId: 0,
          durationMonths: input.durationMonths,
          priceMMK: input.priceMMK,
          expiresAt,
        });
      }

      return { success: true };
    }),
});