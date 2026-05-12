import { and, desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { energyCoreTransactions, shopItems, shopPurchases, users } from "../../../migrations/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const shopRouter = router({
  getItems: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(shopItems).where(eq(shopItems.isActive, true));
  }),

  getItemsByGame: publicProcedure.input(z.object({ game: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(shopItems)
      .where(and(eq(shopItems.game, input.game), eq(shopItems.isActive, true)));
  }),

  purchaseItem: protectedProcedure
    .input(
      z.object({
        shopItemId: z.number(),
        gameId: z.string(),
        inGameName: z.string(),
        serverId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const item = await db.select().from(shopItems).where(eq(shopItems.id, input.shopItemId)).limit(1);
      if (!item[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].mykBalance < item[0].energyCorePrice) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient energy core" });
      }

      const purchaseResult = await db.insert(shopPurchases).values({
        userId: ctx.user.id,
        shopItemId: input.shopItemId,
        gameId: input.gameId,
        inGameName: input.inGameName,
        serverId: input.serverId,
        energyCoreSpent: item[0].energyCorePrice,
        status: "completed",
      });

      await db
        .update(users)
        .set({ mykBalance: user[0].mykBalance - item[0].energyCorePrice })
        .where(eq(users.id, ctx.user.id));

      await db.insert(energyCoreTransactions).values({
        userId: ctx.user.id,
        amount: -item[0].energyCorePrice,
        type: "purchase",
        description: `Purchased ${item[0].name}`,
      });

      return { success: true, purchaseId: 0 };
    }),

  getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(shopPurchases)
      .where(eq(shopPurchases.userId, ctx.user.id))
      .orderBy(desc(shopPurchases.createdAt));
  }),

  createItem: adminProcedure
    .input(
      z.object({
        name: z.string(),
        game: z.string(),
        description: z.string().optional(),
        energyCorePrice: z.number(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(shopItems).values({
        name: input.name,
        game: input.game,
        description: input.description,
        energyCorePrice: input.energyCorePrice,
        category: input.category,
        isActive: true,
      });

      return { success: true };
    }),

  deleteItem: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db.update(shopItems).set({ isActive: false }).where(eq(shopItems.id, input.id));

    return { success: true };
  }),
});