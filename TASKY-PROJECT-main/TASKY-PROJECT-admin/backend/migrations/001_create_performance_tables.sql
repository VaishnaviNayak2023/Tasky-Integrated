-- ============================================================
-- PERFORMANCE ANALYTICS MODULE - DATABASE MIGRATION
-- Version: 1.0
-- Description: Creates tables for employee performance analytics
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. PERFORMANCE SNAPSHOTS
-- ============================================================
-- Tracks historical KPI performance for employees

CREATE TABLE IF NOT EXISTS `performance_snapshots` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` INT UNSIGNED NOT NULL,
  `productivity_score` DECIMAL(5,2) DEFAULT NULL,
  `completion_rate` DECIMAL(5,2) DEFAULT NULL,
  `on_time_rate` DECIMAL(5,2) DEFAULT NULL,
  `focus_score` DECIMAL(5,2) DEFAULT NULL,
  `consistency_score` DECIMAL(5,2) DEFAULT NULL,
  `quality_score` DECIMAL(5,2) DEFAULT NULL,
  `snapshot_date` DATE NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_snapshot_employee` (`employee_id`),
  INDEX `idx_snapshot_date` (`snapshot_date`),
  CONSTRAINT `fk_snapshot_employee` FOREIGN KEY (`employee_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. TASK PERFORMANCE METRICS
-- ============================================================
-- Tracks performance metrics for individual tasks

CREATE TABLE IF NOT EXISTS `task_performance_metrics` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` INT UNSIGNED NOT NULL,
  `employee_id` INT UNSIGNED NOT NULL,
  `priority` VARCHAR(50) DEFAULT NULL,
  `completion_time_days` DECIMAL(8,2) DEFAULT NULL,
  `delay_days` INT DEFAULT NULL,
  `reopened_count` INT DEFAULT 0,
  `sla_met` TINYINT(1) DEFAULT NULL,
  `quality_score` DECIMAL(5,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_task_metric_task` (`task_id`),
  INDEX `idx_task_metric_employee` (`employee_id`),
  INDEX `idx_task_metric_priority` (`priority`),
  CONSTRAINT `fk_task_metric_task` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_metric_employee` FOREIGN KEY (`employee_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. PERFORMANCE GOALS
-- ============================================================
-- Tracks personal performance goals for employees

CREATE TABLE IF NOT EXISTS `performance_goals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` INT UNSIGNED NOT NULL,
  `goal_name` VARCHAR(255) NOT NULL,
  `goal_type` VARCHAR(100) NOT NULL,
  `target_value` DECIMAL NOT NULL,
  `current_value` DECIMAL DEFAULT 0,
  `status` ENUM('not_started', 'in_progress', 'achieved', 'missed') NOT NULL DEFAULT 'not_started',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_goal_employee` (`employee_id`),
  INDEX `idx_goal_status` (`status`),
  CONSTRAINT `fk_goal_employee` FOREIGN KEY (`employee_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. SAVED FILTER PRESETS
-- ============================================================
-- Stores saved filter configurations for analytics dashboards

CREATE TABLE IF NOT EXISTS `saved_filter_presets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `page_type` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
  `is_shared` TINYINT(1) NOT NULL DEFAULT 0,
  `filter_json` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_preset_user` (`user_id`),
  INDEX `idx_preset_page` (`page_type`),
  CONSTRAINT `fk_preset_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- VIEWS FOR PERFORMANCE ANALYTICS
-- ============================================================

-- View: Employee Performance Summary
CREATE OR REPLACE VIEW `vw_employee_performance_summary` AS
SELECT
    u.id AS employee_id,
    u.first_name,
    u.last_name,
    u.employee_code,
    COALESCE(AVG(ps.productivity_score), 0) AS avg_productivity_score,
    COALESCE(AVG(ps.completion_rate), 0) AS avg_completion_rate,
    COALESCE(AVG(ps.on_time_rate), 0) AS avg_on_time_rate,
    COALESCE(AVG(ps.focus_score), 0) AS avg_focus_score,
    COUNT(DISTINCT ps.id) AS snapshot_count
FROM `user` u
LEFT JOIN `performance_snapshots` ps ON ps.employee_id = u.id
WHERE u.is_active = 1
GROUP BY u.id, u.first_name, u.last_name, u.employee_code;

-- View: Task Performance by Priority
CREATE OR REPLACE VIEW `vw_task_performance_by_priority` AS
SELECT
    tpm.employee_id,
    tpm.priority,
    COUNT(*) AS total_tasks,
    SUM(CASE WHEN tpm.sla_met = 1 THEN 1 ELSE 0 END) AS sla_met_count,
    COALESCE(AVG(tpm.completion_time_days), 0) AS avg_completion_time,
    COALESCE(AVG(tpm.quality_score), 0) AS avg_quality_score,
    SUM(tpm.delay_days) AS total_delay_days
FROM `task_performance_metrics` tpm
GROUP BY tpm.employee_id, tpm.priority;

-- View: Goal Progress Summary
CREATE OR REPLACE VIEW `vw_goal_progress_summary` AS
SELECT
    pg.employee_id,
    pg.goal_type,
    COUNT(*) AS total_goals,
    SUM(CASE WHEN pg.status = 'achieved' THEN 1 ELSE 0 END) AS achieved_goals,
    SUM(CASE WHEN pg.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_goals,
    SUM(CASE WHEN pg.status = 'missed' THEN 1 ELSE 0 END) AS missed_goals,
    COALESCE(AVG((pg.current_value / pg.target_value) * 100), 0) AS avg_completion_percentage
FROM `performance_goals` pg
GROUP BY pg.employee_id, pg.goal_type;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Procedure: Create Performance Snapshot
CREATE PROCEDURE `sp_create_performance_snapshot`(
  IN p_employee_id INT UNSIGNED,
  IN p_productivity_score DECIMAL(5,2),
  IN p_completion_rate DECIMAL(5,2),
  IN p_on_time_rate DECIMAL(5,2),
  IN p_focus_score DECIMAL(5,2),
  IN p_consistency_score DECIMAL(5,2),
  IN p_quality_score DECIMAL(5,2),
  IN p_snapshot_date DATE
)
BEGIN
  INSERT INTO `performance_snapshots` (
    employee_id,
    productivity_score,
    completion_rate,
    on_time_rate,
    focus_score,
    consistency_score,
    quality_score,
    snapshot_date
  ) VALUES (
    p_employee_id,
    p_productivity_score,
    p_completion_rate,
    p_on_time_rate,
    p_focus_score,
    p_consistency_score,
    p_quality_score,
    COALESCE(p_snapshot_date, CURDATE())
  );
END //

-- Procedure: Update Task Performance Metrics
CREATE PROCEDURE `sp_update_task_performance_metrics`(
  IN p_task_id INT UNSIGNED,
  IN p_employee_id INT UNSIGNED,
  IN p_priority VARCHAR(50),
  IN p_completion_time_days DECIMAL(8,2),
  IN p_delay_days INT,
  IN p_reopened_count INT,
  IN p_sla_met TINYINT(1),
  IN p_quality_score DECIMAL(5,2)
)
BEGIN
  INSERT INTO `task_performance_metrics` (
    task_id,
    employee_id,
    priority,
    completion_time_days,
    delay_days,
    reopened_count,
    sla_met,
    quality_score
  ) VALUES (
    p_task_id,
    p_employee_id,
    p_priority,
    p_completion_time_days,
    p_delay_days,
    p_reopened_count,
    p_sla_met,
    p_quality_score
  )
  ON DUPLICATE KEY UPDATE
    completion_time_days = p_completion_time_days,
    delay_days = p_delay_days,
    reopened_count = p_reopened_count,
    sla_met = p_sla_met,
    quality_score = p_quality_score;
END //

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
