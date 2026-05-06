CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`energyCoreReward` int NOT NULL DEFAULT 0,
	`type` varchar(100) NOT NULL,
	`condition` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` int NOT NULL,
	`energyCoreReward` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energyCorePackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`amount` int NOT NULL,
	`priceMMK` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `energyCorePackages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energyCoreTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('initial','referral_bonus','game_win','purchase','daily_task','achievement','admin_adjustment') NOT NULL,
	`description` text,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `energyCoreTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameName` varchar(100) NOT NULL,
	`won` boolean NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`energyCoreEarned` int NOT NULL DEFAULT 0,
	`leaderboardPointsEarned` int NOT NULL DEFAULT 0,
	`playersInvolved` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboardPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`gamesWon` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboardPoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboardPoints_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `leaderboardRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`position` int NOT NULL,
	`rewardAmount` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboardRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('energy_core','premium') NOT NULL,
	`paymentMethod` enum('kbz_pay','aya_pay','uab_pay') NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premiumSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`durationMonths` int NOT NULL,
	`priceMMK` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premiumSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`bonusAwarded` boolean NOT NULL DEFAULT false,
	`bonusAwardedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`game` varchar(100) NOT NULL,
	`description` text,
	`energyCorePrice` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopItemId` int NOT NULL,
	`gameId` varchar(255) NOT NULL,
	`inGameName` varchar(255) NOT NULL,
	`serverId` varchar(100),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`energyCoreSpent` int NOT NULL,
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`rewardClaimed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userDailyTaskProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userDailyTaskProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `energyCoreBalance` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isPremium` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `premiumExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);