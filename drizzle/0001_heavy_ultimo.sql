CREATE TABLE `balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`tokenId` int NOT NULL,
	`balance` varchar(100) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deposits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`amount` varchar(100) NOT NULL,
	`status` enum('PENDING','CONFIRMED','FAILED') DEFAULT 'PENDING',
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`level` enum('NONE','BASIC','ADVANCED','FULL') DEFAULT 'NONE',
	`status` enum('PENDING','APPROVED','REJECTED','EXPIRED') DEFAULT 'PENDING',
	`sumsubApplicantId` varchar(100),
	`documentType` varchar(50),
	`documentNumber` varchar(50),
	`firstName` varchar(100),
	`lastName` varchar(100),
	`dateOfBirth` varchar(10),
	`country` varchar(2),
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_id` PRIMARY KEY(`id`),
	CONSTRAINT `kyc_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `liquidityPools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`poolAddress` varchar(42) NOT NULL,
	`token0` varchar(42) NOT NULL,
	`token1` varchar(42) NOT NULL,
	`liquidity` varchar(100) NOT NULL,
	`fee` int NOT NULL,
	`tickLower` int,
	`tickUpper` int,
	`chainId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `liquidityPools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`referredBy` int,
	`totalReferred` int DEFAULT 0,
	`totalRewards` varchar(100) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('CASHBACK','REFERRAL','TRADING','LIQUIDITY') NOT NULL,
	`amount` varchar(100) NOT NULL,
	`status` enum('PENDING','CLAIMED') DEFAULT 'PENDING',
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`address` varchar(42) NOT NULL,
	`chainId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`decimals` int DEFAULT 18,
	`logoUrl` text,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('SWAP','LIQUIDITY_ADD','LIQUIDITY_REMOVE','DEPOSIT','WITHDRAW','TRANSFER') NOT NULL,
	`fromToken` varchar(42),
	`toToken` varchar(42),
	`amount` varchar(100) NOT NULL,
	`hash` varchar(66),
	`status` enum('PENDING','CONFIRMED','FAILED') DEFAULT 'PENDING',
	`chainId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` varchar(42) NOT NULL,
	`chainId` int NOT NULL,
	`safeAddress` varchar(42) NOT NULL,
	`owners` text NOT NULL,
	`threshold` int DEFAULT 1,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`amount` varchar(100) NOT NULL,
	`status` enum('PENDING','CONFIRMED','FAILED') DEFAULT 'PENDING',
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `balances` ADD CONSTRAINT `balances_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `balances` ADD CONSTRAINT `balances_tokenId_tokens_id_fk` FOREIGN KEY (`tokenId`) REFERENCES `tokens`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deposits` ADD CONSTRAINT `deposits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kyc` ADD CONSTRAINT `kyc_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `liquidityPools` ADD CONSTRAINT `liquidityPools_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referredBy_users_id_fk` FOREIGN KEY (`referredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;