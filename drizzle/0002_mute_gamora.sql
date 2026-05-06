CREATE TABLE `rewardCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`leaderboardPosition` int NOT NULL,
	`weekNumber` int NOT NULL,
	`rewardAmount` int NOT NULL,
	`claimed` boolean NOT NULL DEFAULT false,
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `rewardCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `rewardCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `userPremiumSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPremiumSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPremiumSubscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `weeklyLeaderboardSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekNumber` int NOT NULL,
	`userId1` int NOT NULL,
	`userId2` int NOT NULL,
	`userId3` int NOT NULL,
	`points1` int NOT NULL,
	`points2` int NOT NULL,
	`points3` int NOT NULL,
	`resetAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyLeaderboardSnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `weeklyLeaderboardSnapshots_weekNumber_unique` UNIQUE(`weekNumber`)
);
--> statement-breakpoint
ALTER TABLE `energyCoreTransactions` MODIFY COLUMN `type` enum('initial','referral_bonus','game_win','game_loss','purchase','daily_task','achievement','admin_adjustment') NOT NULL;--> statement-breakpoint
ALTER TABLE `premiumSubscriptions` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `premiumSubscriptions` ADD `expiresAt` timestamp NOT NULL;