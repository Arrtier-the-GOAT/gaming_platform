import { publicProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getUserByReferralCode } from "../../core/database/connection";
import { getCurrentReferralWeekWindow, getReferralLeaderboardForWindow } from "./service";

export const referralRouter = router({
  signUpWithReferral: publicProcedure
    .input(
      z.object({
        referralCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.referralCode) {
        const referrer = await getUserByReferralCode(input.referralCode);
        if (!referrer) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid referral code" });
        }
      }

      return { success: true };
    }),

  getTopReferrers: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const currentWeek = getCurrentReferralWeekWindow();
    return getReferralLeaderboardForWindow(db, currentWeek, 10);
  }),
});