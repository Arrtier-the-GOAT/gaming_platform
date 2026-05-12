import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../../core/database/connection";
import { users } from "../../../migrations/schema";
import { ENV } from "../../core/utils/env";

const normalizeOwnerId = (value: string) => value.trim().replace(/^"|"$/g, "");
const isOwnerUser = (user: { id: number; openId: string }) => {
  const ownerId = normalizeOwnerId(ENV.ownerOpenId || "");
  if (!ownerId) return false;

  const numericId = String(user.id);
  const paddedNumericId = numericId.padStart(12, "0");

  return user.openId === ownerId || numericId === ownerId || paddedNumericId === ownerId;
};

export const setupRouter = router({
  promoteToAdmin: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isOwnerUser({ id: ctx.user.id, openId: ctx.user.openId })) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only owner can promote admins" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const targetUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!targetUser[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await db.update(users).set({ role: "admin" }).where(eq(users.id, targetUser[0].id));
      return { success: true, userId: targetUser[0].id, email: targetUser[0].email };
    }),
});