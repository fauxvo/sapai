CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text,
	`plan_id` text,
	`phase` text NOT NULL,
	`input` text,
	`output` text,
	`user_id` text,
	`duration_ms` integer,
	`input_tokens` integer,
	`output_tokens` integer,
	`estimated_cost` real,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `execution_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_log_conversation_id_idx` ON `audit_log` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `audit_log_phase_idx` ON `audit_log` (`phase`);--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `conversation_entities` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_value` text NOT NULL,
	`entity_label` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversation_entities_conversation_id_idx` ON `conversation_entities` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text,
	`source_type` text DEFAULT 'chat' NOT NULL,
	`source_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `conversations_user_id_idx` ON `conversations` (`user_id`);--> statement-breakpoint
CREATE TABLE `execution_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`message_id` text,
	`status` text NOT NULL,
	`plan` text NOT NULL,
	`result` text,
	`approved_at` text,
	`executed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);