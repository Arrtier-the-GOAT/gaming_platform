import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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
  signupIp: varchar("signupIp", { length: 64 }),
  signupUserAgentHash: varchar("signupUserAgentHash", { length: 64 }),
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
 * Local email/password credentials.
 * Kept separate from users so legacy or external login records can coexist.
 */
export const localAuthAccounts = mysqlTable("localAuthAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalAuthAccount = typeof localAuthAccounts.$inferSelect;
export type InsertLocalAuthAccount = typeof localAuthAccounts.$inferInsert;
