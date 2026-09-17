CREATE TABLE `outbox_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`data` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`proccessed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `outbox_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `outbox_users` ADD CONSTRAINT `outbox_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;