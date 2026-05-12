import { desc, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { events } from "../../../migrations/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const eventsRouter = router({
  getActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(events).where(eq(events.isActive, true)).orderBy(desc(events.startDate));
  }),

  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(events).orderBy(desc(events.startDate));
  }),

  createEvent: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(events).values({
        title: input.title,
        description: input.description,
        content: input.content,
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: true,
      });

      return { success: true, eventId: 0 };
    }),

  updateEvent: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(events)
        .set({
          title: input.title,
          description: input.description,
          content: input.content,
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(events.id, input.id));

      return { success: true };
    }),

  deleteEvent: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db.update(events).set({ isActive: false }).where(eq(events.id, input.id));
    return { success: true };
  }),
});