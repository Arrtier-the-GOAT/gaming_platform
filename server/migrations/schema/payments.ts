import {
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";

/**
 * Payment transactions
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // in MMK
  originalAmount: int("originalAmount"),
  discountAmount: int("discountAmount").default(0).notNull(),
  type: mysqlEnum("type", ["energy_core", "premium"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["kbz_pay", "aya_pay", "uab_pay"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  durationMonths: int("durationMonths").default(1).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  referralId: int("referralId"),
  relatedId: int("relatedId"), // ID of related shop purchase or premium subscription
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;