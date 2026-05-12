import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/mysql-core";

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