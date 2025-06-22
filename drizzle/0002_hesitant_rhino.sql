PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_anonymous` integer,
	`role` text,
	`banned` integer,
	`ban_reason` text,
	`ban_expires` integer,
	`sso_uid` text,
	`sso_roles` text DEFAULT '[]',
	`sso_ouid` text,
	`sso_gecos` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "is_anonymous", "role", "banned", "ban_reason", "ban_expires", "sso_uid", "sso_roles", "sso_ouid", "sso_gecos") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at", "is_anonymous", "role", "banned", "ban_reason", "ban_expires", "sso_uid", "sso_roles", "sso_ouid", "sso_gecos" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_sso_ouid_unique` ON `users` (`sso_ouid`);