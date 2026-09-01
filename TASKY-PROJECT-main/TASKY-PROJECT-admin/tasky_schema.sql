-- ============================================================
-- TASKY — Smart Project Task Management & Resource Scheduling
-- Complete MySQL Database Schema
-- ============================================================
-- Version : 1.0
-- Engine  : InnoDB (for FK & transaction support)
-- Charset : utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ORGANIZATION
-- ============================================================
-- Top-level tenant. All users, projects, etc. belong to one org.

CREATE TABLE IF NOT EXISTS `organization` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(200)     NOT NULL,
  `domain`          VARCHAR(100)     DEFAULT NULL       COMMENT 'e.g. acme.com',
  `logo_url`        VARCHAR(500)     DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_org_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 2. ROLE
-- ============================================================
-- Manager-defined roles for sign-up / onboarding.
-- Discussion note: "Creating roles for sign up"

CREATE TABLE IF NOT EXISTS `role` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `name`            VARCHAR(100)     NOT NULL           COMMENT 'e.g. Senior Developer, QA Engineer',
  `description`     TEXT             DEFAULT NULL,
  `access_level`    ENUM('admin','manager','employee')  NOT NULL DEFAULT 'employee',
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_org_name` (`org_id`, `name`),
  CONSTRAINT `fk_role_org` FOREIGN KEY (`org_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 2b. INVITE CODE
-- ============================================================
-- Invite codes for employee registration.

CREATE TABLE IF NOT EXISTS `invite_code` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `code`            VARCHAR(50)      NOT NULL,
  `created_by`      INT UNSIGNED     NOT NULL,
  `max_uses`        INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT '0 means unlimited',
  `current_uses`    INT UNSIGNED     NOT NULL DEFAULT 0,
  `expires_at`      DATETIME         NOT NULL,
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invite_code` (`code`),
  INDEX `idx_invite_org` (`org_id`),
  CONSTRAINT `fk_invite_org` FOREIGN KEY (`org_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 3. USER (Employee / Manager)
-- ============================================================
-- Discussion note: "Manager | Employee [code]"
-- Each user has an employee_code for internal identification.

CREATE TABLE IF NOT EXISTS `user` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `role_id`         INT UNSIGNED     NOT NULL,
  `employee_code`   VARCHAR(30)      NOT NULL           COMMENT 'Internal employee ID, e.g. EMP-001',
  `first_name`      VARCHAR(100)     NOT NULL,
  `last_name`       VARCHAR(100)     NOT NULL,
  `email`           VARCHAR(255)     NOT NULL,
  `password_hash`   VARCHAR(255)     NOT NULL,
  `avatar_url`      VARCHAR(500)     DEFAULT NULL,
  `phone`           VARCHAR(20)      DEFAULT NULL,
  `skills`          JSON             DEFAULT NULL       COMMENT '["Vue.js","TypeScript","Node.js"]',
  `max_hours_per_week` DECIMAL(5,2)  NOT NULL DEFAULT 40.00 COMMENT 'Capacity in hours/week',
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `last_login_at`   DATETIME         DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `uq_user_emp_code` (`org_id`, `employee_code`),
  INDEX `idx_user_org` (`org_id`),
  INDEX `idx_user_role` (`role_id`),
  CONSTRAINT `fk_user_org`  FOREIGN KEY (`org_id`)  REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 4. PROJECT
-- ============================================================

CREATE TABLE IF NOT EXISTS `project` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `created_by`      INT UNSIGNED     NOT NULL           COMMENT 'PM who created the project',
  `name`            VARCHAR(255)     NOT NULL,
  `description`     TEXT             DEFAULT NULL,
  `status`          ENUM('planning','active','on-hold','completed','archived') NOT NULL DEFAULT 'planning',
  `priority`        ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  `color`           VARCHAR(7)       DEFAULT '#1976D2'  COMMENT 'Hex color for UI display',
  `start_date`      DATE             NOT NULL,
  `end_date`        DATE             NOT NULL,
  `progress`        DECIMAL(5,2)     NOT NULL DEFAULT 0.00 COMMENT 'Overall progress 0-100',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_org` (`org_id`),
  INDEX `idx_project_status` (`status`),
  INDEX `idx_project_priority` (`priority`),
  INDEX `idx_project_created_by` (`created_by`),
  CONSTRAINT `fk_project_org`     FOREIGN KEY (`org_id`)     REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 4A. PROJECT MEMBERSHIP & WORKSPACE INVITES
-- ============================================================
-- A user may join a specific project through a manager-issued code.

CREATE TABLE IF NOT EXISTS `project_member` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`  INT UNSIGNED NOT NULL,
  `user_id`     INT UNSIGNED NOT NULL,
  `added_by`    INT UNSIGNED NOT NULL,
  `joined_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_member` (`project_id`, `user_id`),
  CONSTRAINT `fk_member_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_added_by` FOREIGN KEY (`added_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `workspace_invite` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`        INT UNSIGNED NOT NULL,
  `project_id`    INT UNSIGNED DEFAULT NULL,
  `email`         VARCHAR(255) DEFAULT NULL,
  `invite_code`   VARCHAR(40) NOT NULL,
  `invited_by`    INT UNSIGNED NOT NULL,
  `accepted_by`   INT UNSIGNED DEFAULT NULL,
  `expires_at`    DATETIME NOT NULL,
  `accepted_at`   DATETIME DEFAULT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invite_code` (`invite_code`),
  INDEX `idx_invite_org` (`org_id`),
  CONSTRAINT `fk_workspace_invite_org` FOREIGN KEY (`org_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invite_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invite_inviter` FOREIGN KEY (`invited_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_invite_accepter` FOREIGN KEY (`accepted_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 5. PROJECT PHASE
-- ============================================================
-- Discussion note: "Creating phases or steps"

CREATE TABLE IF NOT EXISTS `project_phase` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `project_id`      INT UNSIGNED     NOT NULL,
  `name`            VARCHAR(200)     NOT NULL           COMMENT 'e.g. Design, Development, Testing',
  `description`     TEXT             DEFAULT NULL,
  `sort_order`      INT UNSIGNED     NOT NULL DEFAULT 0,
  `start_date`      DATE             DEFAULT NULL,
  `end_date`        DATE             DEFAULT NULL,
  `status`          ENUM('pending','in-progress','completed') NOT NULL DEFAULT 'pending',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_phase_project` (`project_id`),
  CONSTRAINT `fk_phase_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 6. TASK
-- ============================================================

CREATE TABLE IF NOT EXISTS `task` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `project_id`      INT UNSIGNED     NOT NULL,
  `phase_id`        INT UNSIGNED     DEFAULT NULL       COMMENT 'Optional — belongs to a phase',
  `created_by`      INT UNSIGNED     NOT NULL           COMMENT 'PM or self-assigning employee',
  `title`           VARCHAR(300)     NOT NULL,
  `description`     TEXT             DEFAULT NULL,
  `status`          ENUM('not-started','in-progress','completed','blocked','on-hold') NOT NULL DEFAULT 'not-started',
  `priority`        ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  `deadline`        DATE             NOT NULL,
  `start_date`      DATE             DEFAULT NULL,
  `expected_effort` DECIMAL(7,2)     NOT NULL DEFAULT 0.00 COMMENT 'Estimated hours to complete',
  `actual_effort`   DECIMAL(7,2)     NOT NULL DEFAULT 0.00 COMMENT 'Sum of logged hours',
  `progress`        DECIMAL(5,2)     NOT NULL DEFAULT 0.00 COMMENT '0-100 percent',
  `risk_status`     ENUM('on-track','at-risk','delayed','completed') NOT NULL DEFAULT 'on-track',
  `is_self_assigned` TINYINT(1)      NOT NULL DEFAULT 0 COMMENT 'Discussion note: self-assigning task',
  `delay_reason`    TEXT             DEFAULT NULL       COMMENT 'After 2-3 days of no progress, employee enters reason',
  `delay_flagged_at` DATETIME        DEFAULT NULL       COMMENT 'When the system flagged the delay',
  `completed_at`    DATETIME         DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_task_project` (`project_id`),
  INDEX `idx_task_phase` (`phase_id`),
  INDEX `idx_task_status` (`status`),
  INDEX `idx_task_priority` (`priority`),
  INDEX `idx_task_deadline` (`deadline`),
  INDEX `idx_task_risk` (`risk_status`),
  INDEX `idx_task_created_by` (`created_by`),
  CONSTRAINT `fk_task_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_phase`   FOREIGN KEY (`phase_id`)   REFERENCES `project_phase` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 7. TASK DEPENDENCY
-- ============================================================
-- DAG-based dependency tracking between tasks.

CREATE TABLE IF NOT EXISTS `task_dependency` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `task_id`         INT UNSIGNED     NOT NULL           COMMENT 'The dependent task (successor)',
  `depends_on_id`   INT UNSIGNED     NOT NULL           COMMENT 'The prerequisite task (predecessor)',
  `dependency_type` ENUM('finish-to-start','start-to-start','finish-to-finish','start-to-finish')
                                     NOT NULL DEFAULT 'finish-to-start',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_task_dep` (`task_id`, `depends_on_id`),
  INDEX `idx_dep_depends_on` (`depends_on_id`),
  CONSTRAINT `fk_dep_task`       FOREIGN KEY (`task_id`)       REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dep_depends_on` FOREIGN KEY (`depends_on_id`) REFERENCES `task` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 8. TASK ASSIGNMENT
-- ============================================================
-- Many-to-many: one task can have multiple resources, one resource
-- can be assigned to multiple tasks.

CREATE TABLE IF NOT EXISTS `task_assignment` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `task_id`         INT UNSIGNED     NOT NULL,
  `user_id`         INT UNSIGNED     NOT NULL,
  `assigned_by`     INT UNSIGNED     NOT NULL           COMMENT 'PM who made the assignment',
  `assigned_at`     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at`   DATETIME         DEFAULT NULL       COMMENT 'NULL if still active',
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_active_assignment` (`task_id`, `user_id`, `is_active`),
  INDEX `idx_assignment_user` (`user_id`),
  INDEX `idx_assignment_task` (`task_id`),
  CONSTRAINT `fk_assignment_task`     FOREIGN KEY (`task_id`)     REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_user`     FOREIGN KEY (`user_id`)     REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 9. DAILY WORK LOG
-- ============================================================
-- Employees submit daily logs with work completed, remaining, hours.

CREATE TABLE IF NOT EXISTS `daily_work_log` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `task_id`         INT UNSIGNED     NOT NULL,
  `user_id`         INT UNSIGNED     NOT NULL,
  `log_date`        DATE             NOT NULL,
  `status`          ENUM('completed','partially-completed','in-progress','blocked') NOT NULL DEFAULT 'in-progress',
  `work_completed`  TEXT             NOT NULL           COMMENT 'Description of work done',
  `remaining_work`  TEXT             DEFAULT NULL       COMMENT 'Description of work remaining',
  `comments`        TEXT             DEFAULT NULL,
  `hours_spent`     DECIMAL(5,2)     NOT NULL DEFAULT 0.00,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_log_per_day` (`task_id`, `user_id`, `log_date`),
  INDEX `idx_log_user` (`user_id`),
  INDEX `idx_log_date` (`log_date`),
  CONSTRAINT `fk_log_task` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 10. PROGRESS UPDATE
-- ============================================================
-- Timestamped progress history for audit trail.

CREATE TABLE IF NOT EXISTS `progress_update` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `task_id`         INT UNSIGNED     NOT NULL,
  `user_id`         INT UNSIGNED     NOT NULL,
  `previous_progress` DECIMAL(5,2)   NOT NULL,
  `new_progress`    DECIMAL(5,2)     NOT NULL,
  `notes`           TEXT             DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_progress_task` (`task_id`),
  INDEX `idx_progress_user` (`user_id`),
  INDEX `idx_progress_date` (`created_at`),
  CONSTRAINT `fk_progress_task` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 11. TASK COMMENT
-- ============================================================
-- Discussion note: "Comments to employee"

CREATE TABLE IF NOT EXISTS `task_comment` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `task_id`         INT UNSIGNED     NOT NULL,
  `user_id`         INT UNSIGNED     NOT NULL,
  `parent_comment_id` INT UNSIGNED   DEFAULT NULL       COMMENT 'For threaded replies',
  `content`         TEXT             NOT NULL,
  `is_sticky`       TINYINT(1)       NOT NULL DEFAULT 0 COMMENT 'Discussion note: Sticky note?',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_comment_task` (`task_id`),
  INDEX `idx_comment_user` (`user_id`),
  INDEX `idx_comment_parent` (`parent_comment_id`),
  CONSTRAINT `fk_comment_task`   FOREIGN KEY (`task_id`)          REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_user`   FOREIGN KEY (`user_id`)          REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `task_comment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 12. NOTIFICATION
-- ============================================================
-- Discussion note: "noti?" — System notifications for users.

CREATE TABLE IF NOT EXISTS `notification` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED     NOT NULL           COMMENT 'Recipient',
  `type`            ENUM(
                      'task_assigned',
                      'task_status_changed',
                      'deadline_approaching',
                      'deadline_missed',
                      'risk_alert',
                      'comment_added',
                      'ai_suggestion',
                      'delay_reason_required',
                      'daily_log_reminder',
                      'daily_log_warning',
                      'leave_approved',
                      'leave_rejected',
                      'general'
                    ) NOT NULL DEFAULT 'general',
  `title`           VARCHAR(255)     NOT NULL,
  `message`         TEXT             NOT NULL,
  `reference_type`  ENUM('task','project','user','leave_request') DEFAULT NULL,
  `reference_id`    INT UNSIGNED     DEFAULT NULL       COMMENT 'ID of the related entity',
  `is_read`         TINYINT(1)       NOT NULL DEFAULT 0,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user`     (`user_id`),
  INDEX `idx_notif_read`     (`user_id`, `is_read`),
  INDEX `idx_notif_type`     (`type`),
  INDEX `idx_notif_created`  (`created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 13. EMPLOYEE AVAILABILITY
-- ============================================================
-- Discussion note: "Sat Sun off (5 weekdays)"
-- Discussion note: "Issues - provide opt for weekend"

CREATE TABLE IF NOT EXISTS `employee_availability` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED     NOT NULL,
  `date`            DATE             NOT NULL,
  `is_available`    TINYINT(1)       NOT NULL DEFAULT 1,
  `available_hours` DECIMAL(4,2)     NOT NULL DEFAULT 8.00,
  `day_type`        ENUM('weekday','weekend','holiday','leave') NOT NULL DEFAULT 'weekday',
  `notes`           VARCHAR(500)     DEFAULT NULL       COMMENT 'Reason for weekend work, etc.',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_availability` (`user_id`, `date`),
  INDEX `idx_avail_date` (`date`),
  CONSTRAINT `fk_avail_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 14. LEAVE REQUEST
-- ============================================================
-- Discussion note: "leave or other task" — AI suggests leave
-- when resources are blocked.

CREATE TABLE IF NOT EXISTS `leave_request` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED     NOT NULL,
  `approved_by`     INT UNSIGNED     DEFAULT NULL       COMMENT 'Manager who approved',
  `leave_type`      ENUM('casual','sick','planned','half-day','other') NOT NULL DEFAULT 'casual',
  `start_date`      DATE             NOT NULL,
  `end_date`        DATE             NOT NULL,
  `reason`          TEXT             DEFAULT NULL,
  `status`          ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_leave_user` (`user_id`),
  INDEX `idx_leave_status` (`status`),
  INDEX `idx_leave_dates` (`start_date`, `end_date`),
  CONSTRAINT `fk_leave_user`     FOREIGN KEY (`user_id`)     REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_approver` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 15. AI SUGGESTION
-- ============================================================
-- Discussion notes: "AI suggest", "confirmats?"
-- Stores AI-generated suggestions for PM confirmation.

CREATE TABLE IF NOT EXISTS `ai_suggestion` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `suggested_for`   INT UNSIGNED     DEFAULT NULL       COMMENT 'User the suggestion is about',
  `suggestion_type` ENUM(
                      'resource_recommendation',
                      'schedule_adjustment',
                      'risk_warning',
                      'workload_rebalance',
                      'delay_mitigation',
                      'task_detail_enrichment'
                    ) NOT NULL,
  `reference_type`  ENUM('task','project','user') DEFAULT NULL,
  `reference_id`    INT UNSIGNED     DEFAULT NULL       COMMENT 'ID of the related entity',
  `title`           VARCHAR(300)     NOT NULL,
  `description`     TEXT             NOT NULL,
  `suggested_action` JSON            DEFAULT NULL       COMMENT 'Machine-readable action payload',
  `status`          ENUM('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
  `reviewed_by`     INT UNSIGNED     DEFAULT NULL       COMMENT 'PM who reviewed',
  `reviewed_at`     DATETIME         DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ai_org` (`org_id`),
  INDEX `idx_ai_status` (`status`),
  INDEX `idx_ai_type` (`suggestion_type`),
  INDEX `idx_ai_ref` (`reference_type`, `reference_id`),
  CONSTRAINT `fk_ai_org`      FOREIGN KEY (`org_id`)        REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_for`      FOREIGN KEY (`suggested_for`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_reviewer` FOREIGN KEY (`reviewed_by`)   REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 16. AUDIT LOG
-- ============================================================
-- General-purpose audit trail for all important actions.

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `org_id`          INT UNSIGNED     NOT NULL,
  `user_id`         INT UNSIGNED     DEFAULT NULL       COMMENT 'User who performed the action',
  `action`          VARCHAR(100)     NOT NULL           COMMENT 'e.g. task.created, project.updated',
  `entity_type`     VARCHAR(50)      NOT NULL           COMMENT 'e.g. task, project, user',
  `entity_id`       INT UNSIGNED     NOT NULL,
  `old_values`      JSON             DEFAULT NULL       COMMENT 'Previous state (for updates)',
  `new_values`      JSON             DEFAULT NULL       COMMENT 'New state',
  `ip_address`      VARCHAR(45)      DEFAULT NULL,
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_org` (`org_id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_org`  FOREIGN KEY (`org_id`)  REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 17. DAILY LOG COMPLIANCE
-- ============================================================
-- Tracks whether each employee submitted their daily log.
-- Mentor requirement: "Employees should make sure they log their
-- entries daily if not there should be some kind of reminder or
-- next day it shows up some kind of warning."

CREATE TABLE IF NOT EXISTS `daily_log_compliance` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED     NOT NULL,
  `log_date`        DATE             NOT NULL           COMMENT 'The workday being tracked',
  `status`          ENUM('logged','missed','late','not-required') NOT NULL DEFAULT 'missed'
                                                        COMMENT 'logged=on time, missed=never submitted, late=submitted after deadline, not-required=weekend/leave/holiday',
  `reminder_sent_at` DATETIME        DEFAULT NULL       COMMENT 'When end-of-day reminder was sent',
  `warning_shown`   TINYINT(1)       NOT NULL DEFAULT 0 COMMENT '1 if next-day warning was displayed',
  `warning_acknowledged_at` DATETIME DEFAULT NULL       COMMENT 'When employee dismissed the warning',
  `submitted_at`    DATETIME         DEFAULT NULL       COMMENT 'When the log was actually submitted',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_compliance_user_date` (`user_id`, `log_date`),
  INDEX `idx_compliance_status` (`status`),
  INDEX `idx_compliance_date` (`log_date`),
  CONSTRAINT `fk_compliance_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- VIEWS
-- ============================================================

-- -----------------------------------------------
-- View: Resource Workload Summary
-- -----------------------------------------------
-- Calculates current workload per employee across all active tasks.

CREATE OR REPLACE VIEW `vw_resource_workload` AS
SELECT
    u.id                    AS user_id,
    u.first_name,
    u.last_name,
    u.employee_code,
    r.name                  AS role_name,
    u.max_hours_per_week,
    COUNT(DISTINCT t.id)    AS active_task_count,
    COALESCE(SUM(t.expected_effort * (100 - t.progress) / 100), 0) AS remaining_effort_hours,
    COALESCE(SUM(t.actual_effort), 0) AS total_hours_logged,
    COUNT(DISTINCT t.project_id) AS project_count,
    CASE
        WHEN COALESCE(SUM(t.expected_effort * (100 - t.progress) / 100), 0) > u.max_hours_per_week
        THEN 'overloaded'
        WHEN COALESCE(SUM(t.expected_effort * (100 - t.progress) / 100), 0) > u.max_hours_per_week * 0.8
        THEN 'near-capacity'
        ELSE 'available'
    END AS workload_status
FROM `user` u
JOIN `role` r ON r.id = u.role_id
LEFT JOIN `task_assignment` ta ON ta.user_id = u.id AND ta.is_active = 1
LEFT JOIN `task` t ON t.id = ta.task_id AND t.status IN ('not-started', 'in-progress', 'blocked')
WHERE u.is_active = 1
GROUP BY u.id, u.first_name, u.last_name, u.employee_code, r.name, u.max_hours_per_week;


-- -----------------------------------------------
-- View: At-Risk & Delayed Tasks
-- -----------------------------------------------
-- Identifies tasks that are behind schedule.

CREATE OR REPLACE VIEW `vw_at_risk_tasks` AS
SELECT
    t.id                    AS task_id,
    t.title,
    t.project_id,
    p.name                  AS project_name,
    t.priority,
    t.status,
    t.deadline,
    t.expected_effort,
    t.progress,
    t.risk_status,
    DATEDIFF(t.deadline, CURDATE()) AS days_until_deadline,
    CASE
        WHEN t.status = 'completed' THEN 'completed'
        WHEN CURDATE() > t.deadline THEN 'overdue'
        WHEN DATEDIFF(t.deadline, CURDATE()) <= 3 AND t.progress < 80 THEN 'critical-risk'
        WHEN DATEDIFF(t.deadline, CURDATE()) <= 7 AND t.progress < 60 THEN 'at-risk'
        ELSE 'on-track'
    END AS calculated_risk
FROM `task` t
JOIN `project` p ON p.id = t.project_id
WHERE t.status NOT IN ('completed')
ORDER BY
    CASE
        WHEN CURDATE() > t.deadline THEN 1
        WHEN DATEDIFF(t.deadline, CURDATE()) <= 3 AND t.progress < 80 THEN 2
        WHEN DATEDIFF(t.deadline, CURDATE()) <= 7 AND t.progress < 60 THEN 3
        ELSE 4
    END,
    t.deadline ASC;


-- -----------------------------------------------
-- View: Unassigned Important Tasks
-- -----------------------------------------------
-- Discussion note: "Imp. not assigned"

CREATE OR REPLACE VIEW `vw_unassigned_important_tasks` AS
SELECT
    t.id                    AS task_id,
    t.title,
    t.project_id,
    p.name                  AS project_name,
    t.priority,
    t.deadline,
    t.expected_effort,
    DATEDIFF(t.deadline, CURDATE()) AS days_until_deadline
FROM `task` t
JOIN `project` p ON p.id = t.project_id
LEFT JOIN `task_assignment` ta ON ta.task_id = t.id AND ta.is_active = 1
WHERE ta.id IS NULL
  AND t.status NOT IN ('completed')
  AND t.priority IN ('critical', 'high')
ORDER BY
    FIELD(t.priority, 'critical', 'high') ASC,
    t.deadline ASC;


-- -----------------------------------------------
-- View: Task Priority Distribution
-- -----------------------------------------------
-- Discussion note: "Feature - Task Priority Distr."

CREATE OR REPLACE VIEW `vw_task_priority_distribution` AS
SELECT
    p.id                    AS project_id,
    p.name                  AS project_name,
    t.priority,
    COUNT(*)                AS task_count,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN t.status = 'not-started' THEN 1 ELSE 0 END) AS not_started_count,
    SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) AS blocked_count
FROM `task` t
JOIN `project` p ON p.id = t.project_id
GROUP BY p.id, p.name, t.priority
ORDER BY p.name, FIELD(t.priority, 'critical', 'high', 'medium', 'low');


-- -----------------------------------------------
-- View: Missing Daily Logs
-- -----------------------------------------------
-- Identifies employees who have active task assignments but
-- did not submit a daily work log for a given date.
-- Used to trigger end-of-day reminders and next-day warnings.

CREATE OR REPLACE VIEW `vw_missing_daily_logs` AS
SELECT
    u.id                    AS user_id,
    u.first_name,
    u.last_name,
    u.employee_code,
    u.email,
    CURDATE()               AS check_date,
    COUNT(DISTINCT ta.task_id) AS active_task_count,
    COALESCE(dlc.status, 'missed') AS compliance_status,
    CASE
        WHEN dlc.status = 'logged' THEN 0
        ELSE 1
    END AS needs_reminder
FROM `user` u
JOIN `task_assignment` ta ON ta.user_id = u.id AND ta.is_active = 1
JOIN `task` t ON t.id = ta.task_id AND t.status IN ('in-progress', 'not-started')
LEFT JOIN `daily_log_compliance` dlc ON dlc.user_id = u.id AND dlc.log_date = CURDATE()
WHERE u.is_active = 1
GROUP BY u.id, u.first_name, u.last_name, u.employee_code, u.email, dlc.status
HAVING needs_reminder = 1;


-- -----------------------------------------------
-- View: Employee Analytics Summary
-- -----------------------------------------------
-- Per-employee analytics dashboard data.
-- Mentor requirement: "analytics dashboard for both PM AND EMPLOYEE"

CREATE OR REPLACE VIEW `vw_employee_analytics` AS
SELECT
    u.id                    AS user_id,
    u.first_name,
    u.last_name,
    u.employee_code,
    COUNT(DISTINCT t.id)    AS total_assigned_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
    SUM(CASE WHEN t.status = 'not-started' THEN 1 ELSE 0 END) AS not_started_tasks,
    SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
    COALESCE(SUM(t.actual_effort), 0) AS total_hours_logged,
    COALESCE(SUM(t.expected_effort), 0) AS total_expected_effort,
    COUNT(DISTINCT t.project_id) AS project_count,
    -- On-time completion rate
    CASE
        WHEN SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) = 0 THEN 0
        ELSE ROUND(
            SUM(CASE WHEN t.status = 'completed' AND t.completed_at <= t.deadline THEN 1 ELSE 0 END) * 100.0
            / SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 2)
    END AS on_time_completion_rate,
    -- Daily log compliance (last 30 days)
    (SELECT COUNT(*) FROM `daily_log_compliance` dlc
     WHERE dlc.user_id = u.id AND dlc.status = 'logged'
       AND dlc.log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS logs_submitted_30d,
    (SELECT COUNT(*) FROM `daily_log_compliance` dlc
     WHERE dlc.user_id = u.id AND dlc.status = 'missed'
       AND dlc.log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS logs_missed_30d
FROM `user` u
LEFT JOIN `task_assignment` ta ON ta.user_id = u.id AND ta.is_active = 1
LEFT JOIN `task` t ON t.id = ta.task_id
WHERE u.is_active = 1
GROUP BY u.id, u.first_name, u.last_name, u.employee_code;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- -----------------------------------------------
-- Procedure: Get task stats for a specific employee
-- -----------------------------------------------
-- Discussion note: "click each emp & see"

DELIMITER //

CREATE PROCEDURE `sp_get_employee_task_stats`(IN p_user_id INT UNSIGNED)
BEGIN
    -- Summary stats
    SELECT
        COUNT(DISTINCT t.id) AS total_tasks,
        COUNT(DISTINCT t.project_id) AS total_projects,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
        SUM(CASE WHEN t.status = 'not-started' THEN 1 ELSE 0 END) AS not_started_tasks,
        COALESCE(SUM(t.actual_effort), 0) AS total_hours_logged,
        COALESCE(SUM(t.expected_effort * (100 - t.progress) / 100), 0) AS remaining_effort
    FROM `task_assignment` ta
    JOIN `task` t ON t.id = ta.task_id
    WHERE ta.user_id = p_user_id
      AND ta.is_active = 1;

    -- Task list with details
    SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.deadline,
        t.progress,
        t.risk_status,
        p.name AS project_name,
        p.color AS project_color
    FROM `task_assignment` ta
    JOIN `task` t ON t.id = ta.task_id
    JOIN `project` p ON p.id = t.project_id
    WHERE ta.user_id = p_user_id
      AND ta.is_active = 1
    ORDER BY
        FIELD(t.priority, 'critical', 'high', 'medium', 'low'),
        t.deadline ASC;
END //

DELIMITER ;


-- -----------------------------------------------
-- Procedure: Calculate and update project progress
-- -----------------------------------------------
-- Recalculates overall project progress based on task progress.

DELIMITER //

CREATE PROCEDURE `sp_update_project_progress`(IN p_project_id INT UNSIGNED)
BEGIN
    DECLARE v_progress DECIMAL(5,2);

    SELECT COALESCE(AVG(t.progress), 0)
    INTO v_progress
    FROM `task` t
    WHERE t.project_id = p_project_id;

    UPDATE `project`
    SET `progress` = v_progress,
        `updated_at` = NOW()
    WHERE `id` = p_project_id;
END //

DELIMITER ;


-- ============================================================
-- SEED DATA
-- ============================================================

-- Default organization
INSERT INTO `organization` (`id`, `name`, `domain`) VALUES
(1, 'Tasky Inc.', 'tasky.com');

-- Default roles
INSERT INTO `role` (`id`, `org_id`, `name`, `description`, `access_level`) VALUES
(1, 1, 'Admin',             'System Administrator',           'admin'),
(2, 1, 'Project Manager',   'Manages projects and resources', 'manager'),
(3, 1, 'Senior Developer',  'Senior software developer',      'employee'),
(4, 1, 'Full Stack Developer', 'Full stack developer',        'employee'),
(5, 1, 'UI/UX Designer',    'User interface designer',        'employee'),
(6, 1, 'Backend Developer', 'Backend systems developer',      'employee'),
(7, 1, 'DevOps Engineer',   'Infrastructure & deployment',    'employee'),
(8, 1, 'QA Engineer',       'Quality assurance engineer',     'employee');

-- Default admin user (password: admin123 — BCrypt hash placeholder)
INSERT INTO `user` (`id`, `org_id`, `role_id`, `employee_code`, `first_name`, `last_name`, `email`, `password_hash`, `skills`)
VALUES (1, 1, 1, 'ADM-001', 'System', 'Admin', 'admin@tasky.com', '$2a$10$placeholder_hash', '["Administration"]');


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
