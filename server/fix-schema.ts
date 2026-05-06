import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function fixSchema() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Add mykBalance column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS mykBalance INT DEFAULT 0 NOT NULL
    `);
    console.log("✅ mykBalance column added");

    // Drop energyCoreBalance if it exists
    try {
      await db.execute(sql`
        ALTER TABLE users 
        DROP COLUMN energyCoreBalance
      `);
      console.log("✅ energyCoreBalance column removed");
    } catch (e) {
      console.log("ℹ️ energyCoreBalance column doesn't exist or already removed");
    }

    return { success: true, message: "Schema fixed successfully" };
  } catch (error: any) {
    console.error("❌ Schema fix error:", error);
    throw error;
  }
}
