// Add these tables to drizzle/schema.ts

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Reward codes for top 3 leaderboard players
 */
export const rewardCodes = mysqlTable("rewardCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  userId: int("userId").notNull(),
  leaderboardPosition: int("leaderboardPosition").notNull(), // 1, 2, or 3
  weekNumber: int("weekNumber").notNull(), // Week number for tracking
  rewardAmount: int("rewardAmount").notNull(), // MMK E amount
  claimed: boolean("claimed").default(false).notNull(),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type RewardCode = typeof rewardCodes.$inferSelect;
export type InsertRewardCode = typeof rewardCodes.$inferInsert;

/**
 * Weekly leaderboard snapshots for historical tracking
 */
export const weeklyLeaderboardSnapshots = mysqlTable("weeklyLeaderboardSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  weekNumber: int("weekNumber").notNull().unique(),
  userId1: int("userId1").notNull(), // 1st place
  userId2: int("userId2").notNull(), // 2nd place
  userId3: int("userId3").notNull(), // 3rd place
  points1: int("points1").notNull(),
  points2: int("points2").notNull(),
  points3: int("points3").notNull(),
  resetAt: timestamp("resetAt").defaultNow().notNull(),
});

export type WeeklyLeaderboardSnapshot = typeof weeklyLeaderboardSnapshots.$inferSelect;
export type InsertWeeklyLeaderboardSnapshot = typeof weeklyLeaderboardSnapshots.$inferInsert;
