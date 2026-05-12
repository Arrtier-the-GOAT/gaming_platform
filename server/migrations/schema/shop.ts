import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/mysql-core";

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