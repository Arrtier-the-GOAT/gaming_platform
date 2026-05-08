import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with gaming platform specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Gaming platform fields
  referralCode: varchar("referralCode", { length: 20 }).unique().notNull(),
  referredBy: varchar("referredBy", { length: 20 }), // referral code of the person who referred this user
  mykBalance: int("mykBalance").default(0).notNull(), // Myanmar Kyat balance
  isPremium: boolean("isPremium").default(false).notNull(),
  premiumExpiresAt: timestamp("premiumExpiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Referral tracking table
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  refereeId: int("refereeId").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull(),
  bonusAwarded: boolean("bonusAwarded").default(false).notNull(),
  bonusAwardedAt: timestamp("bonusAwardedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Energy core transactions
 */
export const energyCoreTransactions = mysqlTable("energyCoreTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["initial", "referral_bonus", "game_win", "game_loss", "purchase", "daily_task", "achievement", "admin_adjustment"]).notNull(),
  description: text("description"),
  relatedId: int("relatedId"), // ID of related record (game, task, achievement, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EnergyCoreTransaction = typeof energyCoreTransactions.$inferSelect;
export type InsertEnergyCoreTransaction = typeof energyCoreTransactions.$inferInsert;

/**
 * Premium subscriptions
 */
export const premiumSubscriptions = mysqlTable("premiumSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  durationMonths: int("durationMonths").notNull(), // 1, 3, 5
  priceMMK: int("priceMMK").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
export type InsertPremiumSubscription = typeof premiumSubscriptions.$inferInsert;

/**
 * User premium subscriptions (junction table)
 */
export const userPremiumSubscriptions = mysqlTable("userPremiumSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  subscriptionId: int("subscriptionId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPremiumSubscription = typeof userPremiumSubscriptions.$inferSelect;
export type InsertUserPremiumSubscription = typeof userPremiumSubscriptions.$inferInsert;

/**
 * Shop items (game currencies)
 */
export const shopItems = mysqlTable("shopItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  game: varchar("game", { length: 100 }).notNull(), // MLBB, PUBG, Telegram Premium, HOK, Arena Breakout, etc.
  description: text("description"),
  energyCorePrice: int("energyCorePrice").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = typeof shopItems.$inferInsert;

/**
 * User shop purchases/redemptions
 */
export const shopPurchases = mysqlTable("shopPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shopItemId: int("shopItemId").notNull(),
  gameId: varchar("gameId", { length: 255 }).notNull(),
  inGameName: varchar("inGameName", { length: 255 }).notNull(),
  serverId: varchar("serverId", { length: 100 }), // Required for MLBB, optional for others
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  energyCoreSpent: int("energyCoreSpent").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // KBZ Pay, AyaPay, UAB Pay
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShopPurchase = typeof shopPurchases.$inferSelect;
export type InsertShopPurchase = typeof shopPurchases.$inferInsert;

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

/**
 * Achievements
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  energyCoreReward: int("energyCoreReward").default(0).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // game_related, purchase_related, milestone, etc.
  condition: text("condition"), // JSON description of how to unlock
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  rewardClaimed: boolean("rewardClaimed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Game results/scores
 */
export const gameResults = mysqlTable("gameResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameName: varchar("gameName", { length: 100 }).notNull(),
  won: boolean("won").notNull(),
  points: int("points").default(0).notNull(),
  energyCoreEarned: int("energyCoreEarned").default(0).notNull(),
  leaderboardPointsEarned: int("leaderboardPointsEarned").default(0).notNull(),
  playersInvolved: json("playersInvolved"), // JSON array of player IDs for multiplayer games
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameResult = typeof gameResults.$inferSelect;
export type InsertGameResult = typeof gameResults.$inferInsert;

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
 * Energy core pricing (for admin to manage)
 */
export const energyCorePackages = mysqlTable("energyCorePackages", {
  id: int("id").autoincrement().primaryKey(),
  amount: int("amount").notNull(), // amount of energy core
  priceMMK: int("priceMMK").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EnergyCorePackage = typeof energyCorePackages.$inferSelect;
export type InsertEnergyCorePackage = typeof energyCorePackages.$inferInsert;

/**
 * Payment transactions
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // in MMK
  type: mysqlEnum("type", ["energy_core", "premium"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["kbz_pay", "aya_pay", "uab_pay"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  relatedId: int("relatedId"), // ID of related shop purchase or premium subscription
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

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
