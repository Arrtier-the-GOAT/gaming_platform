import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../../core/utils/cookies";
import { sdk } from "../../core/auth/sdk";
import { publicProcedure, router } from "../../core/trpc/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getUserByReferralCode } from "../../core/database/connection";
import { hashPassword, verifyPassword } from "../../core/utils/password";
import { nanoid } from "nanoid";
import { ENV } from "../../core/utils/env";
import { ensureReferralSystemSchema, getRequestIp, hashUserAgent } from "../referral/service";
import { users, localAuthAccounts, referrals } from "../../../migrations/schema";
import { eq } from "drizzle-orm";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeOwnerId = (value: string) => value.trim().replace(/^"|"$/g, "");

const isOwnerUser = (user: { id: number; openId: string }) => {
  const ownerId = normalizeOwnerId(ENV.ownerOpenId || "");
  if (!ownerId) return false;

  const numericId = String(user.id);
  const paddedNumericId = numericId.padStart(12, "0");

  return user.openId === ownerId || numericId === ownerId || paddedNumericId === ownerId;
};

const generateUniqueReferralCode = async (db: NonNullable<Awaited<ReturnType<typeof getDb>>>) => {
  for (let i = 0; i < 5; i++) {
    const code = nanoid(10).toUpperCase();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, code)).limit(1);
    if (!existing[0]) return code;
  }
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate referral code" });
};

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  register: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100).optional(),
        email: z.string().email(),
        password: z.string().min(8).max(128),
        referralCode: z.string().trim().min(3).max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const email = normalizeEmail(input.email);
      const existingAccount = await db.select().from(localAuthAccounts).where(eq(localAuthAccounts.email, email)).limit(1);

      if (existingAccount[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      let userId: number;
      let openId: string;
      if (existingUser[0]) {
        userId = existingUser[0].id;
        openId = existingUser[0].openId;
      } else {
        const signupIp = getRequestIp(ctx.req);
        const signupUserAgentHash = hashUserAgent(ctx.req.headers["user-agent"] as string | undefined);
        const referrer = input.referralCode ? await getUserByReferralCode(input.referralCode) : undefined;

        if (input.referralCode && !referrer) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid referral code" });
        }

        if (referrer && normalizeEmail(referrer.email || "") === email) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Self-referral is not allowed" });
        }

        const referralCode = await generateUniqueReferralCode(db);
        openId = `local_${nanoid(24)}`;
        const displayName = (input.name?.trim() || email.split("@")[0]).slice(0, 100);

        const createdUser = await db.insert(users).values({
          openId,
          name: displayName,
          email,
          loginMethod: "email",
          referralCode,
          referredBy: referrer?.referralCode,
          signupIp,
          signupUserAgentHash,
          mykBalance: 100,
          lastSignedIn: new Date(),
          role: openId === normalizeOwnerId(ENV.ownerOpenId || "") ? "admin" : "user",
        });

        userId = Number((createdUser as { insertId?: number }).insertId ?? 0);
        if (!userId) {
          const inserted = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
          if (!inserted[0]) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
          }
          userId = inserted[0].id;
        }

        if (isOwnerUser({ id: userId, openId })) {
          await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
        }

        if (referrer) {
          const suspicious = !!signupIp && !!referrer.signupIp && signupIp === referrer.signupIp && signupUserAgentHash === referrer.signupUserAgentHash;

          await db.insert(referrals).values({
            referrerId: referrer.id,
            refereeId: userId,
            referralCode: referrer.referralCode,
            bonusAwarded: false,
            suspicious,
            suspicionReason: suspicious ? "matching_device_fingerprint" : null,
          });
        }
      }

      const passwordHash = await hashPassword(input.password);
      await db.insert(localAuthAccounts).values({
        userId,
        email,
        passwordHash,
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name?.trim() || email,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true } as const;
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const email = normalizeEmail(input.email);
      const account = await db.select().from(localAuthAccounts).where(eq(localAuthAccounts.email, email)).limit(1);

      if (!account[0]) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const passwordOk = await verifyPassword(input.password, account[0].passwordHash);
      if (!passwordOk) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const user = await db.select().from(users).where(eq(users.id, account[0].userId)).limit(1);
      if (!user[0]) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
      }

      if (isOwnerUser({ id: user[0].id, openId: user[0].openId }) && user[0].role !== "admin") {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, user[0].id));
        user[0].role = "admin";
      }

      const sessionToken = await sdk.createSessionToken(user[0].openId, {
        name: user[0].name || user[0].email || "user",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user[0].id));

      return { success: true } as const;
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
