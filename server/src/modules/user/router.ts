import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { users } from "../../../migrations/schema";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return user[0] || null;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  getReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return user[0]?.referralCode || null;
  }),

  getEnergyCore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return user[0]?.mykBalance || 0;
  }),

  getPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const userData = user[0];

    return {
      isPremium: userData?.isPremium || false,
      expiresAt: userData?.premiumExpiresAt || null,
    };
  }),
});