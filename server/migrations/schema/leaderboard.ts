import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * Leaderboard points
 */
export const leaderboardPoints = mysqlTable("leaderboardPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalPoints: int("totalPoints").default(0).notNull(),
  gamesWon: int("gamesWon").default(0).notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardPoints = typeof leaderboardPoints.$inferSelect;
export type InsertLeaderboardPoints = typeof leaderboardPoints.$inferInsert;

/**
 * Leaderboard rewards (top 3 prizes)
 */
export const leaderboardRewards = mysqlTable("leaderboardRewards", {
  id: int("id").autoincrement().primaryKey(),
  position: int("position").notNull(), // 1, 2, 3
  rewardAmount: int("rewardAmount").notNull(), // in MMK E
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardReward = typeof leaderboardRewards.$inferSelect;
export type InsertLeaderboardReward = typeof leaderboardRewards.$inferInsert;

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

/**
 * Leaderboard seasons for tracking seasonal data
 */
export const leaderboardSeasons = mysqlTable("leaderboardSeasons", {
  id: int("id").autoincrement().primaryKey(),
  seasonNumber: int("seasonNumber").notNull().unique(),
  seasonName: varchar("seasonName", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardSeason = typeof leaderboardSeasons.$inferSelect;
export type InsertLeaderboardSeason = typeof leaderboardSeasons.$inferInsert;

/**
 * Seasonal game leaderboard snapshots
 */
export const seasonalGameLeaderboardSnapshots = mysqlTable("seasonalGameLeaderboardSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  seasonId: int("seasonId").notNull(),
  userId: int("userId").notNull(),
  rank: int("rank").notNull(),
  totalPoints: int("totalPoints").notNull(),
  gamesWon: int("gamesWon").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeasonalGameLeaderboardSnapshot = typeof seasonalGameLeaderboardSnapshots.$inferSelect;
export type InsertSeasonalGameLeaderboardSnapshot = typeof seasonalGameLeaderboardSnapshots.$inferInsert;

/**
 * Seasonal referrer leaderboard snapshots
 */
export const seasonalReferrerLeaderboardSnapshots = mysqlTable("seasonalReferrerLeaderboardSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  seasonId: int("seasonId").notNull(),
  referrerId: int("referrerId").notNull(),
  rank: int("rank").notNull(),
  premiumUserCount: int("premiumUserCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeasonalReferrerLeaderboardSnapshot = typeof seasonalReferrerLeaderboardSnapshots.$inferSelect;
export type InsertSeasonalReferrerLeaderboardSnapshot = typeof seasonalReferrerLeaderboardSnapshots.$inferInsert;