-- Migration to add application_role column to user table
-- This explicitly stores whether a user is an employee or project manager

-- Add application_role field
ALTER TABLE `user` 
ADD COLUMN `application_role` ENUM('employee', 'project_manager') DEFAULT NULL COMMENT 'Application role: employee or project_manager' 
AFTER `professional_role_other`;

-- Update existing users based on their role access_level
UPDATE `user` u 
JOIN `role` r ON u.role_id = r.id 
SET u.application_role = CASE 
  WHEN r.access_level = 'manager' THEN 'project_manager'
  WHEN r.access_level = 'employee' THEN 'employee'
  ELSE 'employee'
END 
WHERE u.application_role IS NULL;
