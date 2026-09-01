-- Migration to add professional_role and professional_role_other fields to user table
-- This separates application role (access_level) from professional role

-- Add professional_role field
ALTER TABLE `user` 
ADD COLUMN `professional_role` VARCHAR(50) DEFAULT NULL COMMENT 'Professional role: developer, designer, qa_engineer, business_analyst, other' 
AFTER `phone`;

-- Add professional_role_other field for custom roles
ALTER TABLE `user` 
ADD COLUMN `professional_role_other` VARCHAR(100) DEFAULT NULL COMMENT 'Custom professional role when professional_role is "other"' 
AFTER `professional_role`;

-- Update existing users to have a default professional role if needed
UPDATE `user` SET `professional_role` = 'developer' WHERE `professional_role` IS NULL;
