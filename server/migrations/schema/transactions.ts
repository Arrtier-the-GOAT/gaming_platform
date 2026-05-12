import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp
} from "drizzle-orm/mysql-core";

/**
 * Energy core transactions
 */
export const energyCoreTransactions = mysqlTable("energyCoreTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["initial", "referral_bonus", "weekly_referral_reward", "game_win", "game_loss", "purchase", "daily_task", "achievement", "admin_adjustment"]).notNull(),
  description: text("description"),
  relatedId: int("relatedId"), // ID of related record (game, task, achievement, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EnergyCoreTransaction = typeof energyCoreTransactions.$inferSelect;
export type InsertEnergyCoreTransaction = typeof energyCoreTransactions.$inferInsert;