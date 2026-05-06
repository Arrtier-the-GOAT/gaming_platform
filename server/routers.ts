import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getUserByOpenId, getUserByReferralCode } from "./db";
import { ENV } from "./_core/env";
import { 
  users, 
  referrals, 
  energyCoreTransactions, 
  premiumSubscriptions,
  shopItems,
  shopPurchases,
  leaderboardPoints,
  leaderboardRewards,
  dailyTasks,
  userDailyTaskProgress,
  achievements,
  userAchievements,
  events,
  gameResults,
  energyCorePackages,
  paymentTransactions,
  rewardCodes,
  weeklyLeaderboardSnapshots
} from "../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User profile and account management
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return user[0] || null;
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(users)
          .set({
            name: input.name,
            email: input.email,
            phone: input.phone,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),

    getReferralCode: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return user[0]?.referralCode || null;
    }),

    getEnergyCore: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return user[0]?.energyCoreBalance || 0;
    }),

    getPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const userData = user[0];
      
      return {
        isPremium: userData?.isPremium || false,
        expiresAt: userData?.premiumExpiresAt || null,
      };
    }),
  }),

  // Referral system
  referral: router({
    signUpWithReferral: publicProcedure
      .input(z.object({
        referralCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        if (input.referralCode) {
          const referrer = await getUserByReferralCode(input.referralCode);
          if (!referrer) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid referral code" });
          }

          // Award bonus to referrer if not already awarded
          const existingReferral = await db.select().from(referrals)
            .where(and(
              eq(referrals.referralCode, input.referralCode),
              eq(referrals.bonusAwarded, false)
            )).limit(1);

          if (existingReferral.length > 0) {
            // Award 200 energy core to referrer
            await db.update(users)
              .set({ energyCoreBalance: referrer.energyCoreBalance + 200 })
              .where(eq(users.id, referrer.id));

            // Record transaction
            await db.insert(energyCoreTransactions).values({
              userId: referrer.id,
              amount: 200,
              type: "referral_bonus",
              description: "Referral bonus for new user signup",
            });

            // Mark referral as bonus awarded
            await db.update(referrals)
              .set({ bonusAwarded: true, bonusAwardedAt: new Date() })
              .where(eq(referrals.referralCode, input.referralCode));
          }
        }

        return { success: true };
      }),

    getTopReferrers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get users with most successful referrals
      const result = await db.select().from(users)
        .orderBy(desc(users.energyCoreBalance))
        .limit(10);

      return result;
    }),
  }),

  // Energy core system
  energyCore: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return user[0]?.energyCoreBalance || 0;
    }),

    getPackages: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(energyCorePackages)
        .where(eq(energyCorePackages.isActive, true));
    }),

    getTransactionHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(energyCoreTransactions)
        .where(eq(energyCoreTransactions.userId, ctx.user.id))
        .orderBy(desc(energyCoreTransactions.createdAt))
        .limit(50);
    }),
  }),

  // Shop system
  shop: router({
    getItems: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(shopItems)
        .where(eq(shopItems.isActive, true));
    }),

    getItemsByGame: publicProcedure
      .input(z.object({ game: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.select().from(shopItems)
          .where(and(
            eq(shopItems.game, input.game),
            eq(shopItems.isActive, true)
          ));
      }),

    purchaseItem: protectedProcedure
      .input(z.object({
        shopItemId: z.number(),
        gameId: z.string(),
        inGameName: z.string(),
        serverId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Get item details
        const item = await db.select().from(shopItems)
          .where(eq(shopItems.id, input.shopItemId)).limit(1);
        
        if (!item[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        // Get user balance
        const user = await db.select().from(users)
          .where(eq(users.id, ctx.user.id)).limit(1);
        
        if (!user[0] || user[0].energyCoreBalance < item[0].energyCorePrice) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient energy core" });
        }

        // Create purchase record
        const purchaseResult = await db.insert(shopPurchases).values({
          userId: ctx.user.id,
          shopItemId: input.shopItemId,
          gameId: input.gameId,
          inGameName: input.inGameName,
          serverId: input.serverId,
          energyCoreSpent: item[0].energyCorePrice,
          status: "completed",
        });

        // Deduct energy core
        await db.update(users)
          .set({ energyCoreBalance: user[0].energyCoreBalance - item[0].energyCorePrice })
          .where(eq(users.id, ctx.user.id));

        // Record transaction
        await db.insert(energyCoreTransactions).values({
          userId: ctx.user.id,
          amount: -item[0].energyCorePrice,
          type: "purchase",
          description: `Purchased ${item[0].name}`,
        });

        return { success: true, purchaseId: 0 };
      }),

    getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(shopPurchases)
        .where(eq(shopPurchases.userId, ctx.user.id))
        .orderBy(desc(shopPurchases.createdAt));
    }),

    // Admin shop management
    createItem: adminProcedure
      .input(z.object({
        name: z.string(),
        game: z.string(),
        description: z.string().optional(),
        energyCorePrice: z.number(),
        category: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(shopItems).values({
          name: input.name,
          game: input.game,
          description: input.description,
          energyCorePrice: input.energyCorePrice,
          category: input.category,
          isActive: true,
        });

        return { success: true, itemId: 0 };
      }),

    updateItem: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        energyCorePrice: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(shopItems)
          .set({
            name: input.name,
            energyCorePrice: input.energyCorePrice,
            isActive: input.isActive,
            updatedAt: new Date(),
          })
          .where(eq(shopItems.id, input.id));

        return { success: true };
      }),

    deleteItem: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(shopItems)
          .set({ isActive: false })
          .where(eq(shopItems.id, input.id));

        return { success: true };
      }),
  }),

  // Leaderboard
  leaderboard: router({
    getTopPlayers: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const leaderboard = await db.select().from(leaderboardPoints)
          .orderBy(desc(leaderboardPoints.totalPoints))
          .limit(input.limit);

        // Get user details for each leaderboard entry
        const result = await Promise.all(
          leaderboard.map(async (entry) => {
            const user = await db.select().from(users)
              .where(eq(users.id, entry.userId)).limit(1);
            return {
              ...entry,
              userName: user[0]?.name || "Unknown",
              userEmail: user[0]?.email,
            };
          })
        );

        return result;
      }),

    getRewards: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(leaderboardRewards)
        .orderBy(leaderboardRewards.position);
    }),

    getUserRank: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const leaderboard = await db.select().from(leaderboardPoints)
        .orderBy(desc(leaderboardPoints.totalPoints));

      const rank = leaderboard.findIndex(entry => entry.userId === ctx.user.id) + 1;
      const userEntry = leaderboard.find(entry => entry.userId === ctx.user.id);

      return {
        rank: rank || null,
        totalPoints: userEntry?.totalPoints || 0,
        gamesWon: userEntry?.gamesWon || 0,
      };
    }),

    // Admin reward management
    setReward: adminProcedure
      .input(z.object({
        position: z.number(),
        rewardAmount: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const existing = await db.select().from(leaderboardRewards)
          .where(eq(leaderboardRewards.position, input.position)).limit(1);

        if (existing[0]) {
          await db.update(leaderboardRewards)
            .set({
              rewardAmount: input.rewardAmount,
              description: input.description,
              updatedAt: new Date(),
            })
            .where(eq(leaderboardRewards.position, input.position));
        } else {
          await db.insert(leaderboardRewards).values({
            position: input.position,
            rewardAmount: input.rewardAmount,
            description: input.description,
          });
        }

        return { success: true };
      }),
  }),

  // Premium subscription
  premium: router({
    getPlans: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(premiumSubscriptions)
        .orderBy(premiumSubscriptions.durationMonths);
    }),

    getUserStatus: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db.select().from(users)
        .where(eq(users.id, ctx.user.id)).limit(1);

      return {
        isPremium: user[0]?.isPremium || false,
        expiresAt: user[0]?.premiumExpiresAt,
      };
    }),

    purchasePremium: protectedProcedure
      .input(z.object({
        durationMonths: z.number(),
        paymentMethod: z.enum(["kbz_pay", "aya_pay", "uab_pay"]),
        transactionId: z.string().regex(/^\d{5}$/, "Transaction ID must be exactly 5 digits"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const plan = await db.select().from(premiumSubscriptions)
          .where(eq(premiumSubscriptions.durationMonths, input.durationMonths)).limit(1);

        if (!plan[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
        }

        // Validate transaction ID format (5 digits)
        if (!/^\d{5}$/.test(input.transactionId)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid transaction ID format" });
        }

        // Create payment transaction with verification ID
        await db.insert(paymentTransactions).values({
          userId: ctx.user.id,
          amount: plan[0].priceMMK,
          type: "premium",
          paymentMethod: input.paymentMethod,
          status: "completed",
          transactionId: input.transactionId,
        });

        // Activate premium subscription
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + input.durationMonths);

        await db.insert(premiumSubscriptions).values({
          userId: ctx.user.id,
          durationMonths: input.durationMonths,
          priceMMK: plan[0].priceMMK,
          expiresAt,
        });

        // Deduct from user's energy core balance
        const currentUser = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        const newBalance = (currentUser[0]?.energyCoreBalance || 0) - plan[0].priceMMK;
        
        await db.update(users)
          .set({
            energyCoreBalance: newBalance,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          transactionId: input.transactionId,
          amount: plan[0].priceMMK,
          expiresAt,
        };
      }),

    // Admin premium pricing management
    updatePremiumPrice: adminProcedure
      .input(z.object({
        durationMonths: z.number(),
        priceMMK: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const existing = await db.select().from(premiumSubscriptions)
          .where(eq(premiumSubscriptions.durationMonths, input.durationMonths)).limit(1);

        if (existing[0]) {
          await db.update(premiumSubscriptions)
            .set({
              priceMMK: input.priceMMK,
              updatedAt: new Date(),
            })
            .where(eq(premiumSubscriptions.durationMonths, input.durationMonths));
        } else {
          // Create a default premium subscription (for admin to use)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          await db.insert(premiumSubscriptions).values({
            userId: 0, // Placeholder for admin-created subscriptions
            durationMonths: input.durationMonths,
            priceMMK: input.priceMMK,
            expiresAt,
          });
        }

        return { success: true };
      }),
  }),

  // Daily tasks
  dailyTask: router({
    getTasks: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(dailyTasks)
        .orderBy(dailyTasks.day);
    }),

    getUserProgress: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await db.select().from(userDailyTaskProgress)
        .where(and(
          eq(userDailyTaskProgress.userId, ctx.user.id),
          gte(userDailyTaskProgress.date, today)
        ));
    }),

    completeTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const task = await db.select().from(dailyTasks)
          .where(eq(dailyTasks.id, input.taskId)).limit(1);

        if (!task[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        }

        // Check if already completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await db.select().from(userDailyTaskProgress)
          .where(and(
            eq(userDailyTaskProgress.userId, ctx.user.id),
            eq(userDailyTaskProgress.taskId, input.taskId),
            gte(userDailyTaskProgress.date, today)
          )).limit(1);

        if (existing[0]?.completed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Task already completed today" });
        }

        // Award energy core
        const user = await db.select().from(users)
          .where(eq(users.id, ctx.user.id)).limit(1);

        await db.update(users)
          .set({ energyCoreBalance: (user[0]?.energyCoreBalance || 0) + task[0].energyCoreReward })
          .where(eq(users.id, ctx.user.id));

        // Record transaction
        await db.insert(energyCoreTransactions).values({
          userId: ctx.user.id,
          amount: task[0].energyCoreReward,
          type: "daily_task",
          description: `Daily task reward - Day ${task[0].day}`,
        });

        // Update progress
        if (existing[0]) {
          await db.update(userDailyTaskProgress)
            .set({ completed: true, completedAt: new Date() })
            .where(eq(userDailyTaskProgress.id, existing[0].id));
        } else {
          await db.insert(userDailyTaskProgress).values({
            userId: ctx.user.id,
            taskId: input.taskId,
            completed: true,
            completedAt: new Date(),
            date: today,
          });
        }

        return { success: true, rewardAmount: task[0].energyCoreReward };
      }),
  }),

  // Achievements
  achievement: router({
    getAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(achievements);
    }),

    getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, ctx.user.id));
    }),

    claimReward: protectedProcedure
      .input(z.object({ achievementId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const userAchievement = await db.select().from(userAchievements)
          .where(and(
            eq(userAchievements.userId, ctx.user.id),
            eq(userAchievements.achievementId, input.achievementId)
          )).limit(1);

        if (!userAchievement[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
        }

        if (userAchievement[0].rewardClaimed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Reward already claimed" });
        }

        const achievement = await db.select().from(achievements)
          .where(eq(achievements.id, input.achievementId)).limit(1);

        if (!achievement[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
        }

        // Award energy core
        const user = await db.select().from(users)
          .where(eq(users.id, ctx.user.id)).limit(1);

        await db.update(users)
          .set({ energyCoreBalance: (user[0]?.energyCoreBalance || 0) + achievement[0].energyCoreReward })
          .where(eq(users.id, ctx.user.id));

        // Record transaction
        await db.insert(energyCoreTransactions).values({
          userId: ctx.user.id,
          amount: achievement[0].energyCoreReward,
          type: "achievement",
          description: `Achievement reward: ${achievement[0].name}`,
        });

        // Mark reward as claimed
        await db.update(userAchievements)
          .set({ rewardClaimed: true })
          .where(eq(userAchievements.id, userAchievement[0].id));

        return { success: true, rewardAmount: achievement[0].energyCoreReward };
      }),

    // Admin achievement management
    createAchievement: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        energyCoreReward: z.number(),
        type: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(achievements).values({
          name: input.name,
          description: input.description,
          energyCoreReward: input.energyCoreReward,
          type: input.type,
        });

        return { success: true, achievementId: 0 };
      }),

    updateAchievement: adminProcedure
      .input(z.object({
        id: z.number(),
        energyCoreReward: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(achievements)
          .set({
            energyCoreReward: input.energyCoreReward,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(eq(achievements.id, input.id));

        return { success: true };
      }),
  }),

  // Events
  event: router({
    getActive: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(events)
        .where(eq(events.isActive, true))
        .orderBy(desc(events.startDate));
    }),

    getAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(events)
        .orderBy(desc(events.startDate));
    }),

    // Admin event management
    createEvent: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(events).values({
          title: input.title,
          description: input.description,
          content: input.content,
          startDate: input.startDate,
          endDate: input.endDate,
          isActive: true,
        });

        return { success: true, eventId: 0 };
      }),

    updateEvent: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(events)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            isActive: input.isActive,
            updatedAt: new Date(),
          })
          .where(eq(events.id, input.id));

        return { success: true };
      }),

    deleteEvent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(events)
          .set({ isActive: false })
          .where(eq(events.id, input.id));

        return { success: true };
      }),
  }),

  // Game results and scoring
  game: router({
    recordResult: protectedProcedure
      .input(z.object({
        gameName: z.string(),
        won: z.boolean(),
        points: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const energyCoreReward = input.won ? 5 : -2; // Win: +5, Loss: -2
        let leaderboardPointsReward = input.won ? 2 : 0;

        // Check if user is premium and add bonus points
        if (input.won) {
          const premiumSub = await db.select().from(premiumSubscriptions)
            .where(and(
              eq(premiumSubscriptions.userId, ctx.user.id),
              gte(premiumSubscriptions.expiresAt, new Date())
            )).limit(1);

          if (premiumSub.length > 0) {
            leaderboardPointsReward += 2; // Premium bonus: +2 points (total 4)
          }
        }

        // Record game result
        await db.insert(gameResults).values({
          userId: ctx.user.id,
          gameName: input.gameName,
          won: input.won,
          points: input.points,
          energyCoreEarned: energyCoreReward,
          leaderboardPointsEarned: leaderboardPointsReward,
        });

        // Award or deduct energy core
        const user = await db.select().from(users)
          .where(eq(users.id, ctx.user.id)).limit(1);

        const newBalance = Math.max(0, (user[0]?.energyCoreBalance || 0) + energyCoreReward);
        await db.update(users)
          .set({ energyCoreBalance: newBalance })
          .where(eq(users.id, ctx.user.id));

        await db.insert(energyCoreTransactions).values({
          userId: ctx.user.id,
          amount: energyCoreReward,
          type: input.won ? "game_win" : "game_loss",
          description: input.won ? `Won ${input.gameName}` : `Lost ${input.gameName} (-2 energy core)`,
        });

        // Update leaderboard
        const leaderboard = await db.select().from(leaderboardPoints)
          .where(eq(leaderboardPoints.userId, ctx.user.id)).limit(1);

        if (leaderboard[0]) {
          const newTotalPoints = leaderboard[0].totalPoints + leaderboardPointsReward;
          await db.update(leaderboardPoints)
            .set({
              totalPoints: newTotalPoints,
              gamesWon: input.won ? leaderboard[0].gamesWon + 1 : leaderboard[0].gamesWon,
              lastUpdated: new Date(),
            })
            .where(eq(leaderboardPoints.userId, ctx.user.id));
        } else if (input.won) {
          await db.insert(leaderboardPoints).values({
            userId: ctx.user.id,
            totalPoints: leaderboardPointsReward,
            gamesWon: 1,
          });
        }

        return { success: true, resultId: 0, leaderboardPoints: leaderboardPointsReward };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const results = await db.select().from(gameResults)
        .where(eq(gameResults.userId, ctx.user.id));

      const totalGames = results.length;
      const gamesWon = results.filter(r => r.won).length;
      const totalEarned = results.reduce((sum, r) => sum + r.energyCoreEarned, 0);

      return {
        totalGames,
        gamesWon,
        winRate: totalGames > 0 ? (gamesWon / totalGames * 100).toFixed(2) : "0",
        totalEarned,
      };
    }),
  }),

  // Setup and owner-only operations
  setup: router({
    promoteToAdmin: protectedProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only allow owner to promote admins
        if (ctx.user.openId !== ENV.ownerOpenId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only owner can promote admins" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Find user by email
        const targetUser = await db.select().from(users)
          .where(eq(users.email, input.email)).limit(1);

        if (!targetUser[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        // Promote to admin
        await db.update(users)
          .set({ role: "admin" })
          .where(eq(users.id, targetUser[0].id));

        return { success: true, userId: targetUser[0].id, email: targetUser[0].email };
      }),
  }),

  // Admin dashboard
  admin: router({
    getDashboard: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const totalUsers = await db.select().from(users);
      const premiumUsers = totalUsers.filter(u => u.isPremium);
      const totalTransactions = await db.select().from(energyCoreTransactions);

      return {
        totalUsers: totalUsers.length,
        premiumUsers: premiumUsers.length,
        totalTransactions: totalTransactions.length,
        totalEnergyDistributed: totalTransactions.reduce((sum, t) => sum + t.amount, 0),
      };
    }),

    getUsers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db.select().from(users).orderBy(desc(users.createdAt));
    }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.userId));

        return { success: true };
      }),

    adjustEnergyCore: adminProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const user = await db.select().from(users)
          .where(eq(users.id, input.userId)).limit(1);

        if (!user[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const newBalance = (user[0].energyCoreBalance || 0) + input.amount;

        await db.update(users)
          .set({ energyCoreBalance: newBalance })
          .where(eq(users.id, input.userId));

        await db.insert(energyCoreTransactions).values({
          userId: input.userId,
          amount: input.amount,
          type: "admin_adjustment",
          description: input.reason,
        });

        return { success: true, newBalance };
      }),
  }),

  // Reward codes and weekly leaderboard
  rewardCode: router({
    generateWeeklyRewardCodes: adminProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const weekNumber = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;

      // Get top 3 players
      const topPlayers = await db.select().from(leaderboardPoints)
        .orderBy(desc(leaderboardPoints.totalPoints))
        .limit(3);

      if (topPlayers.length < 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough players for rewards",
        });
      }

      // Generate reward codes for top 3
      const rewardAmounts = [5000, 3000, 1000];
      const generatedCodes = [];

      for (let i = 0; i < 3; i++) {
        const code = Math.random().toString(36).substring(2, 14).toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.insert(rewardCodes).values({
          code,
          userId: topPlayers[i].userId,
          leaderboardPosition: i + 1,
          weekNumber,
          rewardAmount: rewardAmounts[i],
          expiresAt,
        });

        generatedCodes.push({
          position: i + 1,
          code,
          userId: topPlayers[i].userId,
          amount: rewardAmounts[i],
        });
      }

      return { success: true, codes: generatedCodes };
    }),

    getUserRewardCodes: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const codes = await db.select().from(rewardCodes)
        .where(eq(rewardCodes.userId, ctx.user.id))
        .orderBy(desc(rewardCodes.createdAt));

      return codes;
    }),
  }),

  // Notifications
  notification: router({
    sendAchievementNotification: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        achievementName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // In a real app, you would send this to a push notification service
        // For now, we just log it and return success
        console.log(`[Notification] Achievement for user ${ctx.user.id}:`, input);
        return { success: true, notificationId: Date.now() };
      }),

    sendGameRewardNotification: protectedProcedure
      .input(z.object({
        gameName: z.string(),
        rewardAmount: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log(`[Notification] Game reward for user ${ctx.user.id}:`, input);
        return { success: true, notificationId: Date.now() };
      }),

    sendPremiumNotification: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log(`[Notification] Premium notification for user ${ctx.user.id}:`, input);
        return { success: true, notificationId: Date.now() };
      }),

    sendLeaderboardNotification: protectedProcedure
      .input(z.object({
        position: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log(`[Notification] Leaderboard notification for user ${ctx.user.id}:`, input);
        return { success: true, notificationId: Date.now() };
      }),
  }),
});
export type AppRouter = typeof appRouter;