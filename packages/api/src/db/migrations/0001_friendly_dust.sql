CREATE INDEX `audit_log_conversation_id_idx` ON `audit_log` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `audit_log_phase_idx` ON `audit_log` (`phase`);--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `conversation_entities_conversation_id_idx` ON `conversation_entities` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);