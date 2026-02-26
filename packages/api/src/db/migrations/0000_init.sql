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
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
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
CREATE TABLE `pipeline_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text,
	`input_message` text NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`mode` text DEFAULT 'auto' NOT NULL,
	`current_stage` text,
	`result` text,
	`error` text,
	`user_id` text,
	`started_at` text NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`duration_ms` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `pipeline_runs_status_idx` ON `pipeline_runs` (`status`);--> statement-breakpoint
CREATE INDEX `pipeline_runs_user_id_idx` ON `pipeline_runs` (`user_id`);--> statement-breakpoint
CREATE INDEX `pipeline_runs_created_at_idx` ON `pipeline_runs` (`created_at`);--> statement-breakpoint
CREATE INDEX `pipeline_runs_conversation_id_idx` ON `pipeline_runs` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `pipeline_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`stage` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`started_at` text,
	`completed_at` text,
	`duration_ms` integer,
	`detail` text,
	`input` text,
	`output` text,
	`progress_items` text,
	`error` text,
	`cost_estimate` text,
	`order` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `pipeline_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pipeline_stages_run_id_idx` ON `pipeline_stages` (`run_id`);--> statement-breakpoint
CREATE INDEX `pipeline_stages_run_id_order_idx` ON `pipeline_stages` (`run_id`, `order`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text,
	`plan_id` text,
	`run_id` text,
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
	FOREIGN KEY (`plan_id`) REFERENCES `execution_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`run_id`) REFERENCES `pipeline_runs`(`id`) ON UPDATE no action ON DELETE set null
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
CREATE INDEX `conversation_entities_conversation_id_idx` ON `conversation_entities` (`conversation_id`);