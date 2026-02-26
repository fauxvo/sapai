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
ALTER TABLE `audit_log` ADD `run_id` text REFERENCES `pipeline_runs`(`id`) ON DELETE set null;
