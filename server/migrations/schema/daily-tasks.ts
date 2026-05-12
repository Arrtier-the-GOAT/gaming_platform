import { int, mysqlTable, text, timestamp, boolean } from "drizzle-orm/mysql-core";

/**
 * Daily tasks
 */
export const dailyTasks = mysqlTable("dailyTasks", {
  id: int("id").autoincrement().primaryKey(),
  day: int("day").notNull(), // 1-7
  energyCoreReward: int("energyCoreReward").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = typeof dailyTasks.$inferInsert;

/**
 * User daily task progress
 */
export const userDailyTaskProgress = mysqlTable("userDailyTaskProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  date: timestamp("date").notNull(), // Date of the task
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserDailyTaskProgress = typeof userDailyTaskProgress.$inferSelect;
export type InsertUserDailyTaskProgress = typeof userDailyTaskProgress.$inferInsert;
