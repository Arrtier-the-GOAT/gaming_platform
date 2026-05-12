CREATE TABLE `localAuthAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localAuthAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `localAuthAccounts_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `localAuthAccounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `referralWeeklyRewardPayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekKey` varchar(32) NOT NULL,
	`weekStartAt` timestamp NOT NULL,
	`weekEndAt` timestamp NOT NULL,
	`referrerId` int NOT NULL,
	`successfulReferralCount` int NOT NULL DEFAULT 0,
	`fixedCommission` int NOT NULL,
	`bonusReward` int NOT NULL,
	`totalReward` int NOT NULL,
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralWeeklyRewardPayouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralWeeklyRewardPayouts_weekKey_unique` UNIQUE(`weekKey`)
);
--> statement-breakpoint
ALTER TABLE `energyCoreTransactions` MODIFY COLUMN `type` enum('initial','referral_bonus','weekly_referral_reward','game_win','game_loss','purchase','daily_task','achievement','admin_adjustment') NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentTransactions` ADD COLUMN IF NOT EXISTS `originalAmount` int;--> statement-breakpoint
ALTER TABLE `paymentTransactions` ADD COLUMN IF NOT EXISTS `discountAmount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentTransactions` ADD COLUMN IF NOT EXISTS `durationMonths` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentTransactions` ADD COLUMN IF NOT EXISTS `referralId` int;--> statement-breakpoint
ALTER TABLE `referrals` ADD COLUMN IF NOT EXISTS `suspicious` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD COLUMN IF NOT EXISTS `suspicionReason` varchar(255);--> statement-breakpoint
ALTER TABLE `referrals` ADD COLUMN IF NOT EXISTS `referredPremiumActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referrals` ADD COLUMN IF NOT EXISTS `discountApplied` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD COLUMN IF NOT EXISTS `discountAmount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `signupIp` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `signupUserAgentHash` varchar(64);