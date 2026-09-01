-- Migration: Add invite_code table for organisation-managed invite codes
-- Replaces hardcoded invite codes with DB-managed codes

CREATE TABLE IF NOT EXISTS `invite_code` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `org_id`        INT UNSIGNED     NOT NULL,
  `code`          VARCHAR(20)      NOT NULL,
  `created_by`    INT UNSIGNED     NOT NULL      COMMENT 'PM who generated the code',
  `max_uses`      INT UNSIGNED     NOT NULL DEFAULT 50,
  `current_uses`  INT UNSIGNED     NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)       NOT NULL DEFAULT 1,
  `expires_at`    DATETIME         NOT NULL,
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invite_code` (`code`),
  INDEX `idx_invite_org` (`org_id`),
  INDEX `idx_invite_active` (`is_active`, `org_id`),
  CONSTRAINT `fk_invite_org`     FOREIGN KEY (`org_id`)     REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invite_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
