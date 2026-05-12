import { and, eq, gte } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { dailyTasks, energyCoreTransactions, userDailyTaskProgress, users } from "../../../migrations/schema";

export const dailyTasksRouter = router({
  getTasks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(dailyTasks).orderBy(dailyTasks.day);
  }),

  getUserProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db
      .select()
      .from(userDailyTaskProgress)
      .where(and(eq(userDailyTaskProgress.userId, ctx.user.id), gte(userDailyTaskProgress.date, today)));
  }),

  completeTask: protectedProcedure.input(z.object({ taskId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const task = await db.select().from(dailyTasks).where(eq(dailyTasks.id, input.taskId)).limit(1);
    if (!task[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(userDailyTaskProgress)
      .where(and(eq(userDailyTaskProgress.userId, ctx.user.id), eq(userDailyTaskProgress.taskId, input.taskId), gte(userDailyTaskProgress.date, today)))
      .limit(1);

    if (existing[0]?.completed) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Task already completed today" });
    }

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

    await db
      .update(users)
      .set({ mykBalance: (user[0]?.mykBalance || 0) + task[0].energyCoreReward })
      .where(eq(users.id, ctx.user.id));

    await db.insert(energyCoreTransactions).values({
      userId: ctx.user.id,
      amount: task[0].energyCoreReward,
      type: "daily_task",
      description: `Daily task reward - Day ${task[0].day}`,
    });

    if (existing[0]) {
      await db.update(userDailyTaskProgress).set({ completed: true, completedAt: new Date() }).where(eq(userDailyTaskProgress.id, existing[0].id));
    } else {
      await db.insert(userDailyTaskProgress).values({
        userId: ctx.user.id,
        taskId: input.taskId,
        completed: true,
        completedAt: new Date(),
        date: today,
      });
    }

    return { success: true, rewardAmount: task[0].energyCoreReward };
  }),
});