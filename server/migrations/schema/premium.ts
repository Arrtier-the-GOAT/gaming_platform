import {
  int,
  mysqlTable,
  timestamp
} from "drizzle-orm/mysql-core";

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