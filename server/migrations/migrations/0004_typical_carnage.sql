CREATE TABLE `leaderboardSeasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonNumber` int NOT NULL,
	`seasonName` varchar(255),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboardSeasons_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboardSeasons_seasonNumber_unique` UNIQUE(`seasonNumber`)
);
--> statement-breakpoint
CREATE TABLE `seasonalGameLeaderboardSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`userId` int NOT NULL,
	`rank` int NOT NULL,
	`totalPoints` int NOT NULL,
	`gamesWon` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seasonalGameLeaderboardSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seasonalReferrerLeaderboardSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`referrerId` int NOT NULL,
	`rank` int NOT NULL,
	`premiumUserCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seasonalReferrerLeaderboardSnapshots_id` PRIMARY KEY(`id`)
);
