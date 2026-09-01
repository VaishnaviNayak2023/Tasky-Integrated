-- Migration: Add pm_settings table for per-PM scheduling and notification preferences

CREATE TABLE IF NOT EXISTS `pm_settings` (
  `id`                        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`                   INT UNSIGNED     NOT NULL,
  `strict_resource_limits`    TINYINT(1)       NOT NULL DEFAULT 0   COMMENT 'Prevent over-100% capacity assignments',
  `dynamic_deadline_shifting` TINYINT(1)       NOT NULL DEFAULT 1   COMMENT 'Auto-adjust dependent task deadlines',
  `high_priority_interruption` TINYINT(1)      NOT NULL DEFAULT 0   COMMENT 'Allow critical tasks to bump lower priority',
  `alert_missing_logs`        TINYINT(1)       NOT NULL DEFAULT 1   COMMENT 'Alert on missing daily logs',
  `alert_conflicts`           TINYINT(1)       NOT NULL DEFAULT 1   COMMENT 'Alert on cross-project conflicts',
  `max_hours_threshold`       DECIMAL(5,2)     NOT NULL DEFAULT 40.00 COMMENT 'Weekly hours threshold for overload detection',
  `created_at`                DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_user` (`user_id`),
  CONSTRAINT `fk_settings_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
