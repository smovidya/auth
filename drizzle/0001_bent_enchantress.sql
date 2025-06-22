CREATE TABLE `oauth_access_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`client_id` text,
	`user_id` text,
	`scopes` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_access_tokens_access_token_unique` ON `oauth_access_tokens` (`access_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_access_tokens_refresh_token_unique` ON `oauth_access_tokens` (`refresh_token`);--> statement-breakpoint
CREATE TABLE `oauth_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`icon` text,
	`metadata` text,
	`client_id` text,
	`client_secret` text,
	`redirect_u_r_ls` text,
	`type` text,
	`disabled` integer,
	`user_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_applications_client_id_unique` ON `oauth_applications` (`client_id`);--> statement-breakpoint
CREATE TABLE `oauth_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`user_id` text,
	`scopes` text,
	`created_at` integer,
	`updated_at` integer,
	`consent_given` integer
);
--> statement-breakpoint
CREATE TABLE `sso_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`issuer` text NOT NULL,
	`oidc_config` text,
	`saml_config` text,
	`user_id` text,
	`provider_id` text NOT NULL,
	`organization_id` text,
	`domain` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sso_providers_provider_id_unique` ON `sso_providers` (`provider_id`);--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banned` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_expires` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `sso_uid` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sso_roles` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sso_ouid` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sso_gecos` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_sso_ouid_unique` ON `users` (`sso_ouid`);