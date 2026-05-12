import { desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../core/database/connection";
import { energyCorePackages, energyCoreTransactions, users } from "../../../migrations/schema";

export const energyCoreRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return user[0]?.mykBalance || 0;
  }),

  getPackages: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(energyCorePackages).where(eq(energyCorePackages.isActive, true));
  }),

  getTransactionHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(energyCoreTransactions).where(eq(energyCoreTransactions.userId, ctx.user.id)).orderBy(desc(energyCoreTransactions.createdAt)).limit(50);
  }),
});
