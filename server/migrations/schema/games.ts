import {
  int,
  mysqlTable,
  varchar,
  boolean,
  json,
  timestamp
} from "drizzle-orm/mysql-core";

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