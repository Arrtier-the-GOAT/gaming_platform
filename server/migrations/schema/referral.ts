import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/mysql-core";

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
  suspicious: boolean("suspicious").default(false).notNull(),
  suspicionReason: varchar("suspicionReason", { length: 255 }),
  referredPremiumActivatedAt: timestamp("referredPremiumActivatedAt"),
  discountApplied: boolean("discountApplied").default(false).notNull(),
  discountAmount: int("discountAmount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Weekly referral reward payouts
 */
export const referralWeeklyRewardPayouts = mysqlTable("referralWeeklyRewardPayouts", {
  id: int("id").autoincrement().primaryKey(),
  weekKey: varchar("weekKey", { length: 32 }).notNull().unique(),
  weekStartAt: timestamp("weekStartAt").notNull(),
  weekEndAt: timestamp("weekEndAt").notNull(),
  referrerId: int("referrerId").notNull(),
  successfulReferralCount: int("successfulReferralCount").default(0).notNull(),
  fixedCommission: int("fixedCommission").notNull(),
  bonusReward: int("bonusReward").notNull(),
  totalReward: int("totalReward").notNull(),
  paidAt: timestamp("paidAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralWeeklyRewardPayout = typeof referralWeeklyRewardPayouts.$inferSelect;
export type InsertReferralWeeklyRewardPayout = typeof referralWeeklyRewardPayouts.$inferInsert;