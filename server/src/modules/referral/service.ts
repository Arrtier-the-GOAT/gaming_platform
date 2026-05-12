import { createHash } from "node:crypto";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { energyCoreTransactions, paymentTransactions, referralWeeklyRewardPayouts, referrals, users, premiumSubscriptions } from "../../../migrations/schema";
import { getDb } from "../../core/database/connection";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export const REFERRAL_DISCOUNT_PERCENT = 10;
export const WEEKLY_REFERRAL_FIXED_COMMISSION = 3000;
export const WEEKLY_REFERRAL_BONUS = 1000;
export const WEEKLY_REFERRAL_TOTAL_REWARD = WEEKLY_REFERRAL_FIXED_COMMISSION + WEEKLY_REFERRAL_BONUS;

export type ReferralWeekWindow = {
  start: Date;
  end: Date;
  weekKey: string;
};

type ReferralScoreEntry = {
  referrerId: number;
  referrerName: string;
  referrerEmail: string | null;
  successfulReferralCount: number;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function toWeekKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getCurrentReferralWeekWindow(now = new Date()): ReferralWeekWindow {
  const cursor = new Date(now);
  const day = cursor.getUTCDay(); // Sunday = 0, Monday = 1
  const daysSinceMonday = (day + 6) % 7;
  cursor.setUTCHours(0, 0, 0, 0);
  cursor.setUTCDate(cursor.getUTCDate() - daysSinceMonday);

  const start = new Date(cursor);
  const end = new Date(cursor);
  end.setUTCDate(end.getUTCDate() + 7);

  return {
    start,
    end,
    weekKey: toWeekKey(start),
  };
}

export function getPreviousReferralWeekWindow(now = new Date()): ReferralWeekWindow {
  const current = getCurrentReferralWeekWindow(now);
  const previousStart = new Date(current.start);
  previousStart.setUTCDate(previousStart.getUTCDate() - 7);
  const previousEnd = new Date(current.start);

  return {
    start: previousStart,
    end: previousEnd,
    weekKey: toWeekKey(previousStart),
  };
}

export function isPremiumActive(
  user:
    | {
        isPremium?: boolean | null;
        premiumExpiresAt?: Date | null;
      }
    | null
    | undefined,
  referenceTime = new Date()
) {
  if (!user?.isPremium || !user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt).getTime() > referenceTime.getTime();
}

export function hashUserAgent(userAgent: string | null | undefined) {
  return createHash("sha256")
    .update(userAgent || "")
    .digest("hex");
}

export function getRequestIp(req: { headers?: Record<string, unknown>; socket?: { remoteAddress?: string | null } }) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket?.remoteAddress?.trim() || null;
}

export async function ensureReferralSystemSchema(db: Db) {
  const statements = [
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS signupIp VARCHAR(64) NULL`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS signupUserAgentHash VARCHAR(64) NULL`,
    sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS suspicious BOOLEAN NOT NULL DEFAULT false`,
    sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS suspicionReason VARCHAR(255) NULL`,
    sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referredPremiumActivatedAt TIMESTAMP NULL`,
    sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS discountApplied BOOLEAN NOT NULL DEFAULT false`,
    sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS discountAmount INT NOT NULL DEFAULT 0`,
    sql`ALTER TABLE paymentTransactions ADD COLUMN IF NOT EXISTS durationMonths INT NOT NULL DEFAULT 1`,
    sql`ALTER TABLE paymentTransactions ADD COLUMN IF NOT EXISTS originalAmount INT NULL`,
    sql`ALTER TABLE paymentTransactions ADD COLUMN IF NOT EXISTS discountAmount INT NOT NULL DEFAULT 0`,
    sql`ALTER TABLE paymentTransactions ADD COLUMN IF NOT EXISTS referralId INT NULL`,
    sql`
      CREATE TABLE IF NOT EXISTS referralWeeklyRewardPayouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        weekKey VARCHAR(32) NOT NULL UNIQUE,
        weekStartAt TIMESTAMP NOT NULL,
        weekEndAt TIMESTAMP NOT NULL,
        referrerId INT NOT NULL,
        successfulReferralCount INT NOT NULL DEFAULT 0,
        fixedCommission INT NOT NULL,
        bonusReward INT NOT NULL,
        totalReward INT NOT NULL,
        paidAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `,
  ];

  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Duplicate column name") && !message.includes("already exists") && !message.includes("exists")) {
        throw error;
      }
    }
  }
}

export async function getPremiumPlanQuote(db: Db, userId: number, durationMonths: number) {
  await ensureReferralSystemSchema(db);

  const [plan] = await db.select().from(premiumSubscriptions).where(eq(premiumSubscriptions.durationMonths, durationMonths)).limit(1);

  if (!plan) {
    return null;
  }

  const [referral] = await db.select().from(referrals).where(eq(referrals.refereeId, userId)).limit(1);

  const basePrice = plan.priceMMK;
  const canApplyReferralDiscount = !!referral && !referral.suspicious && !referral.discountApplied && referral.referrerId !== userId;
  const discountAmount = canApplyReferralDiscount ? Math.floor((basePrice * REFERRAL_DISCOUNT_PERCENT) / 100) : 0;

  return {
    plan,
    referral,
    basePrice,
    discountPercent: canApplyReferralDiscount ? REFERRAL_DISCOUNT_PERCENT : 0,
    discountAmount,
    finalPrice: basePrice - discountAmount,
    hasReferralDiscount: canApplyReferralDiscount,
    abuseBlocked: !!referral?.suspicious,
  };
}

export async function markReferralPremiumActivated(db: Db, refereeUserId: number, activatedAt: Date) {
  await ensureReferralSystemSchema(db);

  const [referral] = await db.select().from(referrals).where(eq(referrals.refereeId, refereeUserId)).limit(1);

  if (!referral || referral.suspicious || referral.referredPremiumActivatedAt) {
    return referral ?? null;
  }

  await db.update(referrals).set({ referredPremiumActivatedAt: activatedAt }).where(eq(referrals.id, referral.id));

  return { ...referral, referredPremiumActivatedAt: activatedAt };
}

export async function getReferralLeaderboardForWindow(db: Db, window: ReferralWeekWindow, limit = 10, referenceTime = new Date()) {
  await ensureReferralSystemSchema(db);

  const weeklyReferrals = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.suspicious, false), gte(referrals.referredPremiumActivatedAt, window.start), lt(referrals.referredPremiumActivatedAt, window.end)));

  const scores = new Map<number, ReferralScoreEntry>();

  for (const referral of weeklyReferrals) {
    const [referrerUser] = await db.select().from(users).where(eq(users.id, referral.referrerId)).limit(1);
    const [invitedUser] = await db.select().from(users).where(eq(users.id, referral.refereeId)).limit(1);

    if (!isPremiumActive(referrerUser, referenceTime) || !isPremiumActive(invitedUser, referenceTime)) {
      continue;
    }

    const existing = scores.get(referral.referrerId);
    if (existing) {
      existing.successfulReferralCount += 1;
      continue;
    }

    scores.set(referral.referrerId, {
      referrerId: referral.referrerId,
      referrerName: referrerUser?.name || "Unknown",
      referrerEmail: referrerUser?.email || null,
      successfulReferralCount: 1,
    });
  }

  return Array.from(scores.values())
    .sort((a, b) => {
      if (b.successfulReferralCount !== a.successfulReferralCount) {
        return b.successfulReferralCount - a.successfulReferralCount;
      }
      return a.referrerId - b.referrerId;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      weekKey: window.weekKey,
      weekStartAt: window.start,
      weekEndAt: window.end,
    }));
}

export async function getWeeklyReferralRewardHistory(db: Db, limit = 10) {
  await ensureReferralSystemSchema(db);

  const payouts = await db.select().from(referralWeeklyRewardPayouts).orderBy(desc(referralWeeklyRewardPayouts.paidAt)).limit(limit);

  return Promise.all(
    payouts.map(async payout => {
      const [winner] = await db.select().from(users).where(eq(users.id, payout.referrerId)).limit(1);
      return {
        ...payout,
        winnerName: winner?.name || "Unknown",
        winnerEmail: winner?.email || null,
      };
    })
  );
}

export async function runWeeklyReferralSettlement(db: Db, now = new Date()) {
  await ensureReferralSystemSchema(db);

  const previousWeek = getPreviousReferralWeekWindow(now);
  const [existingPayout] = await db.select().from(referralWeeklyRewardPayouts).where(eq(referralWeeklyRewardPayouts.weekKey, previousWeek.weekKey)).limit(1);

  if (existingPayout) {
    return { processed: false as const, reason: "already_processed", weekKey: previousWeek.weekKey };
  }

  const leaderboard = await getReferralLeaderboardForWindow(db, previousWeek, 1, previousWeek.end);

  if (!leaderboard[0]) {
    return { processed: false as const, reason: "no_winner", weekKey: previousWeek.weekKey };
  }

  const winner = leaderboard[0];
  const [winnerUser] = await db.select().from(users).where(eq(users.id, winner.referrerId)).limit(1);
  if (!winnerUser) {
    return { processed: false as const, reason: "winner_not_found", weekKey: previousWeek.weekKey };
  }

  await db
    .update(users)
    .set({ mykBalance: (winnerUser.mykBalance || 0) + WEEKLY_REFERRAL_TOTAL_REWARD })
    .where(eq(users.id, winner.referrerId));

  await db.insert(energyCoreTransactions).values({
    userId: winner.referrerId,
    amount: WEEKLY_REFERRAL_TOTAL_REWARD,
    type: "weekly_referral_reward",
    description: `Weekly referral reward (${previousWeek.weekKey})`,
  });

  await db.insert(referralWeeklyRewardPayouts).values({
    weekKey: previousWeek.weekKey,
    weekStartAt: previousWeek.start,
    weekEndAt: previousWeek.end,
    referrerId: winner.referrerId,
    successfulReferralCount: winner.successfulReferralCount,
    fixedCommission: WEEKLY_REFERRAL_FIXED_COMMISSION,
    bonusReward: WEEKLY_REFERRAL_BONUS,
    totalReward: WEEKLY_REFERRAL_TOTAL_REWARD,
    paidAt: now,
  });

  return {
    processed: true as const,
    weekKey: previousWeek.weekKey,
    winner,
    totalReward: WEEKLY_REFERRAL_TOTAL_REWARD,
  };
}

let settlementTimer: NodeJS.Timeout | null = null;

export function startWeeklyReferralSettlementWorker() {
  if (settlementTimer) return;

  const run = async () => {
    const db = await getDb();
    if (!db) return;
    try {
      await runWeeklyReferralSettlement(db, new Date());
    } catch (error) {
      console.error("[Referral] Weekly settlement failed", error);
    }
  };

  void run();
  settlementTimer = setInterval(
    () => {
      void run();
    },
    5 * 60 * 1000
  );
}
