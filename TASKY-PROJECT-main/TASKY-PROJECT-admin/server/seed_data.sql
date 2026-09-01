-- ============================================================
-- TASKY — Comprehensive Seed Data for PM-Side Testing
-- ============================================================
-- Run AFTER the main schema and all migrations.
-- Password for ALL users: password123
-- BCrypt hash: $2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Clear existing data (preserving schema)
-- ============================================================
DELETE FROM `audit_log`;
DELETE FROM `ai_suggestion`;
DELETE FROM `daily_log_compliance`;
DELETE FROM `progress_update`;
DELETE FROM `daily_work_log`;
DELETE FROM `task_comment`;
DELETE FROM `task_assignment`;
DELETE FROM `task_dependency`;
DELETE FROM `task`;
DELETE FROM `project_phase`;
DELETE FROM `project`;
DELETE FROM `leave_request`;
DELETE FROM `employee_availability`;
DELETE FROM `notification`;
DELETE FROM `invite_code`;
DELETE FROM `user`;
DELETE FROM `role`;
DELETE FROM `organization`;

-- ============================================================
-- 1. ORGANIZATION
-- ============================================================
INSERT INTO `organization` (`id`, `name`, `domain`, `logo_url`) VALUES
(1, 'Tasky Inc.', 'tasky.com', NULL);

-- ============================================================
-- 2. ROLES
-- ============================================================
INSERT INTO `role` (`id`, `org_id`, `name`, `description`, `access_level`) VALUES
(1, 1, 'Admin',               'System Administrator',           'admin'),
(2, 1, 'Project Manager',     'Manages projects and resources', 'manager'),
(3, 1, 'Senior Developer',    'Senior software developer',      'employee'),
(4, 1, 'Full Stack Developer','Full stack developer',            'employee'),
(5, 1, 'UI/UX Designer',      'User interface designer',        'employee'),
(6, 1, 'Backend Developer',   'Backend systems developer',      'employee'),
(7, 1, 'DevOps Engineer',     'Infrastructure & deployment',    'employee'),
(8, 1, 'QA Engineer',         'Quality assurance engineer',     'employee');

-- ============================================================
-- 3. USERS (1 PM + 8 Employees)
-- ============================================================
-- Password for all: password123

INSERT INTO `user` (`id`, `org_id`, `role_id`, `employee_code`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `skills`, `max_hours_per_week`, `is_active`, `professional_role`, `application_role`) VALUES
-- Project Manager
(1, 1, 2, 'PM-001',  'Alex',    'Morgan',   'pm@tasky.com',          '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0100', '["Project Management","Agile","Scrum"]', 40.00, 1, 'other', 'project_manager'),

-- Employees
(2, 1, 3, 'EMP-001', 'Sarah',   'Johnson',  'sarah.j@tasky.com',     '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0201', '["Vue.js","React","TypeScript","CSS"]',   40.00, 1, 'developer', 'employee'),
(3, 1, 4, 'EMP-002', 'Michael', 'Chen',     'michael.c@tasky.com',   '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0202', '["Node.js","Python","Vue.js","MySQL"]',   40.00, 1, 'developer', 'employee'),
(4, 1, 5, 'EMP-003', 'Emily',   'Davis',    'emily.d@tasky.com',     '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0203', '["Figma","Adobe XD","CSS","HTML"]',        35.00, 1, 'designer', 'employee'),
(5, 1, 6, 'EMP-004', 'James',   'Wilson',   'james.w@tasky.com',     '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0204', '["Java","Spring Boot","PostgreSQL","Docker"]', 40.00, 1, 'developer', 'employee'),
(6, 1, 7, 'EMP-005', 'Lisa',    'Anderson', 'lisa.a@tasky.com',      '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0205', '["AWS","Docker","Kubernetes","CI/CD"]',    40.00, 1, 'other', 'employee'),
(7, 1, 8, 'EMP-006', 'David',   'Brown',    'david.b@tasky.com',     '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0206', '["Selenium","Jest","Cypress","Testing"]',  40.00, 1, 'qa_engineer', 'employee'),
(8, 1, 4, 'EMP-007', 'Anna',    'Martinez', 'anna.m@tasky.com',      '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0207', '["React","Node.js","MongoDB","GraphQL"]',  40.00, 1, 'developer', 'employee'),
(9, 1, 6, 'EMP-008', 'Robert',  'Kim',      'robert.k@tasky.com',    '$2b$10$DzYSU/E6cNledVHArbIeE.0k/0QjHSr9PjGIrYWyRW9wxemvhQvC6', '+1-555-0208', '["Python","Django","FastAPI","MySQL"]',    40.00, 1, 'developer', 'employee');

-- ============================================================
-- 4. PROJECTS
-- ============================================================
INSERT INTO `project` (`id`, `org_id`, `created_by`, `name`, `description`, `status`, `priority`, `color`, `start_date`, `end_date`, `progress`) VALUES
(1, 1, 1, 'E-Commerce Platform Redesign',
   'Complete overhaul of the existing e-commerce platform with modern UI, improved performance, and new payment integrations. Includes product catalog, shopping cart, checkout, and admin dashboard.',
   'active', 'high', '#1976D2',
   DATE_SUB(CURDATE(), INTERVAL 52 DAY), DATE_ADD(CURDATE(), INTERVAL 54 DAY), 0),

(2, 1, 1, 'Mobile Banking App',
   'Native mobile application for banking services with secure transactions, account management, bill payments, and real-time notifications.',
   'active', 'critical', '#D32F2F',
   DATE_SUB(CURDATE(), INTERVAL 38 DAY), DATE_ADD(CURDATE(), INTERVAL 100 DAY), 0),

(3, 1, 1, 'Internal Analytics Dashboard',
   'Business intelligence dashboard for internal metrics and reporting. Includes data visualization, report generation, user access control, and real-time data feeds.',
   'active', 'medium', '#388E3C',
   DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 69 DAY), 0),

(4, 1, 1, 'Marketing Campaign Platform',
   'Automated marketing campaign management platform with email templates, A/B testing, audience segmentation, and performance tracking.',
   'planning', 'low', '#7B1FA2',
   DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 131 DAY), 0);

-- ============================================================
-- 5. PROJECT PHASES
-- ============================================================
INSERT INTO `project_phase` (`id`, `project_id`, `name`, `description`, `sort_order`, `start_date`, `end_date`, `status`) VALUES
-- E-Commerce phases
(1, 1, 'Design',       'UI/UX design and prototyping',     1, DATE_SUB(CURDATE(), INTERVAL 52 DAY), DATE_SUB(CURDATE(), INTERVAL 22 DAY), 'completed'),
(2, 1, 'Development',  'Core feature development',         2, DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 39 DAY), 'in-progress'),
(3, 1, 'Testing',      'QA testing and bug fixes',         3, DATE_ADD(CURDATE(), INTERVAL 40 DAY), DATE_ADD(CURDATE(), INTERVAL 54 DAY), 'pending'),

-- Mobile Banking phases
(4, 2, 'Architecture', 'System architecture and security',  1, DATE_SUB(CURDATE(), INTERVAL 38 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'in-progress'),
(5, 2, 'Development',  'Feature development',              2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 70 DAY), 'pending'),
(6, 2, 'Testing',      'Security testing and QA',          3, DATE_ADD(CURDATE(), INTERVAL 71 DAY), DATE_ADD(CURDATE(), INTERVAL 100 DAY), 'pending'),

-- Analytics Dashboard phases
(7, 3, 'Design',       'Dashboard wireframes and design',  1, DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'completed'),
(8, 3, 'Development',  'Backend and frontend development', 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 54 DAY), 'in-progress'),
(9, 3, 'Deployment',   'Deployment and monitoring setup',  3, DATE_ADD(CURDATE(), INTERVAL 55 DAY), DATE_ADD(CURDATE(), INTERVAL 69 DAY), 'pending'),

-- Marketing Campaign phases
(10, 4, 'Planning',    'Requirements and architecture',    1, DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 54 DAY), 'pending'),
(11, 4, 'Development', 'Platform development',             2, DATE_ADD(CURDATE(), INTERVAL 55 DAY), DATE_ADD(CURDATE(), INTERVAL 115 DAY), 'pending'),
(12, 4, 'Launch',      'Beta launch and feedback',         3, DATE_ADD(CURDATE(), INTERVAL 116 DAY), DATE_ADD(CURDATE(), INTERVAL 131 DAY), 'pending');

-- ============================================================
-- 6. TASKS (25 tasks across 4 projects)
-- ============================================================
INSERT INTO `task` (`id`, `project_id`, `phase_id`, `created_by`, `title`, `description`, `status`, `priority`, `deadline`, `start_date`, `expected_effort`, `actual_effort`, `progress`, `risk_status`, `is_self_assigned`) VALUES
-- E-Commerce Platform (Project 1) — 8 tasks
(1,  1, 1, 1, 'Design System Implementation',
   'Create a comprehensive design system with reusable components, color palette, typography, and spacing guidelines for the e-commerce platform.',
   'completed', 'high', DATE_SUB(CURDATE(), INTERVAL 28 DAY), DATE_SUB(CURDATE(), INTERVAL 48 DAY), 24.00, 26.00, 100.00, 'completed', 0),

(2,  1, 2, 1, 'Product Catalog API',
   'Build RESTful API for product catalog management including CRUD operations, search, filtering, and pagination.',
   'in-progress', 'high', DATE_ADD(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 17 DAY), 40.00, 20.00, 55.00, 'on-track', 0),

(3,  1, 2, 1, 'Shopping Cart Module',
   'Develop shopping cart functionality with add/remove items, quantity management, price calculation, and session persistence.',
   'in-progress', 'high', DATE_ADD(CURDATE(), INTERVAL 19 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY), 32.00, 8.00, 30.00, 'on-track', 0),

(4,  1, 2, 1, 'Payment Gateway Integration',
   'Integrate Stripe and PayPal payment gateways with secure checkout flow, error handling, and refund support.',
   'not-started', 'critical', DATE_ADD(CURDATE(), INTERVAL 29 DAY), NULL, 48.00, 0.00, 0.00, 'on-track', 0),

(5,  1, 2, 1, 'User Authentication & Profiles',
   'Implement user registration, login, password reset, profile management, and order history views.',
   'in-progress', 'medium', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY), 28.00, 18.00, 65.00, 'on-track', 0),

(6,  1, 3, 1, 'Performance Optimization',
   'Optimize load times, implement lazy loading, CDN caching, image compression, and database query optimization.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 49 DAY), NULL, 20.00, 0.00, 0.00, 'on-track', 0),

(7,  1, 2, 1, 'Admin Dashboard',
   'Build admin panel for product management, order processing, user management, and sales analytics.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 34 DAY), NULL, 36.00, 0.00, 0.00, 'on-track', 0),

(8,  1, 3, 1, 'E2E Testing Suite',
   'Create comprehensive end-to-end testing suite covering checkout flow, user management, and edge cases.',
   'not-started', 'low', DATE_ADD(CURDATE(), INTERVAL 51 DAY), NULL, 16.00, 0.00, 0.00, 'on-track', 0),

-- Mobile Banking App (Project 2) — 7 tasks
(9,  2, 4, 1, 'Security Architecture Design',
   'Design the security architecture including encryption standards, token management, biometric auth, and audit logging.',
   'completed', 'critical', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 33 DAY), 30.00, 32.00, 100.00, 'completed', 0),

(10, 2, 4, 1, 'User Authentication System',
   'Implement secure user authentication with JWT, 2FA, biometric login, and session management.',
   'in-progress', 'critical', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 17 DAY), 36.00, 22.00, 60.00, 'at-risk', 0),

(11, 2, 5, 1, 'Account Management Module',
   'Build account overview, transaction history, statement generation, and account settings features.',
   'not-started', 'high', DATE_ADD(CURDATE(), INTERVAL 24 DAY), NULL, 40.00, 0.00, 0.00, 'on-track', 0),

(12, 2, 5, 1, 'Fund Transfer System',
   'Implement internal/external fund transfers, scheduled payments, beneficiary management, and transfer limits.',
   'not-started', 'high', DATE_ADD(CURDATE(), INTERVAL 39 DAY), NULL, 44.00, 0.00, 0.00, 'on-track', 0),

(13, 2, 5, 1, 'Push Notifications Service',
   'Set up real-time push notifications for transactions, security alerts, and account updates.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 54 DAY), NULL, 20.00, 0.00, 0.00, 'on-track', 0),

(14, 2, 5, 1, 'Bill Payment Integration',
   'Integrate utility bill payments, mobile recharge, and scheduled recurring payments.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 64 DAY), NULL, 32.00, 0.00, 0.00, 'on-track', 0),

(15, 2, 6, 1, 'Security Penetration Testing',
   'Conduct comprehensive security testing including penetration testing, vulnerability assessment, and compliance checks.',
   'not-started', 'critical', DATE_ADD(CURDATE(), INTERVAL 90 DAY), NULL, 24.00, 0.00, 0.00, 'on-track', 0),

-- Internal Analytics Dashboard (Project 3) — 6 tasks
(16, 3, 7, 1, 'Dashboard Wireframes & Mockups',
   'Create wireframes and high-fidelity mockups for all dashboard views including charts, tables, and filters.',
   'completed', 'high', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 19 DAY), 16.00, 14.00, 100.00, 'completed', 0),

(17, 3, 8, 1, 'Data Pipeline Setup',
   'Set up ETL pipeline for aggregating data from multiple sources into the analytics database.',
   'in-progress', 'high', DATE_ADD(CURDATE(), INTERVAL 14 DAY), CURDATE(), 28.00, 16.00, 50.00, 'on-track', 0),

(18, 3, 8, 1, 'Chart Components Library',
   'Build reusable chart components (bar, line, pie, heatmap) with interactive tooltips and drill-down.',
   'in-progress', 'high', DATE_ADD(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 24.00, 18.00, 70.00, 'at-risk', 0),

(19, 3, 8, 1, 'User Access Control',
   'Implement role-based access control for dashboard sections, data export permissions, and audit logging.',
   'in-progress', 'medium', DATE_ADD(CURDATE(), INTERVAL 19 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 20.00, 5.00, 25.00, 'on-track', 0),

(20, 3, 8, 1, 'Report Generation Engine',
   'Build automated and on-demand report generation with PDF/CSV export and email scheduling.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 40 DAY), NULL, 24.00, 0.00, 0.00, 'on-track', 0),

(21, 3, 9, 1, 'Monitoring & Alerting Setup',
   'Configure application monitoring, error tracking, and alerting for the analytics platform.',
   'not-started', 'low', DATE_ADD(CURDATE(), INTERVAL 64 DAY), NULL, 12.00, 0.00, 0.00, 'on-track', 0),

-- Marketing Campaign Platform (Project 4) — 4 tasks
(22, 4, 10, 1, 'Requirements Documentation',
   'Gather and document detailed requirements for the marketing campaign platform features.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 44 DAY), NULL, 16.00, 0.00, 0.00, 'on-track', 0),

(23, 4, 10, 1, 'Technical Architecture Design',
   'Design the system architecture, database schema, API contracts, and integration points.',
   'not-started', 'high', DATE_ADD(CURDATE(), INTERVAL 51 DAY), NULL, 20.00, 0.00, 0.00, 'on-track', 0),

(24, 4, 11, 1, 'Email Template Engine',
   'Build drag-and-drop email template builder with preview, variables, and A/B testing support.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 85 DAY), NULL, 36.00, 0.00, 0.00, 'on-track', 0),

(25, 4, 11, 1, 'Campaign Analytics Module',
   'Develop campaign performance tracking with open rates, click rates, conversion tracking, and ROI analysis.',
   'not-started', 'medium', DATE_ADD(CURDATE(), INTERVAL 101 DAY), NULL, 28.00, 0.00, 0.00, 'on-track', 0);

-- ============================================================
-- 7. TASK DEPENDENCIES
-- ============================================================
INSERT INTO `task_dependency` (`task_id`, `depends_on_id`, `dependency_type`) VALUES
-- E-Commerce: Shopping Cart depends on Product Catalog
(3, 2, 'finish-to-start'),
-- E-Commerce: Payment depends on Shopping Cart
(4, 3, 'finish-to-start'),
-- E-Commerce: Admin Dashboard depends on Product Catalog
(7, 2, 'start-to-start'),
-- E-Commerce: E2E Testing depends on Payment Gateway
(8, 4, 'finish-to-start'),
-- E-Commerce: Performance Optimization depends on Auth
(6, 5, 'finish-to-start'),

-- Banking: Auth depends on Security Architecture
(10, 9, 'finish-to-start'),
-- Banking: Account Management depends on Auth
(11, 10, 'finish-to-start'),
-- Banking: Fund Transfer depends on Account Management
(12, 11, 'finish-to-start'),
-- Banking: Bill Payment depends on Fund Transfer
(14, 12, 'start-to-start'),
-- Banking: Security Testing depends on Auth
(15, 10, 'finish-to-start'),

-- Analytics: Data Pipeline depends on Wireframes
(17, 16, 'finish-to-start'),
-- Analytics: Charts depend on Data Pipeline
(18, 17, 'start-to-start'),
-- Analytics: Reports depend on Data Pipeline
(20, 17, 'finish-to-start'),
-- Analytics: Monitoring depends on Reports
(21, 20, 'finish-to-start'),

-- Marketing: Architecture depends on Requirements
(23, 22, 'finish-to-start'),
-- Marketing: Email Engine depends on Architecture
(24, 23, 'finish-to-start'),
-- Marketing: Analytics depends on Email Engine
(25, 24, 'start-to-start');

-- ============================================================
-- 8. TASK ASSIGNMENTS (Many-to-Many)
-- ============================================================
INSERT INTO `task_assignment` (`task_id`, `user_id`, `assigned_by`, `is_active`) VALUES
-- E-Commerce tasks
(1, 4, 1, 1),   -- Design System → Emily (Designer)
(1, 2, 1, 1),   -- Design System → Sarah (also helped)
(2, 3, 1, 1),   -- Product Catalog API → Michael
(2, 5, 1, 1),   -- Product Catalog API → James (also on it)
(3, 2, 1, 1),   -- Shopping Cart → Sarah
(3, 8, 1, 1),   -- Shopping Cart → Anna
(5, 3, 1, 1),   -- User Auth → Michael
(5, 9, 1, 1),   -- User Auth → Robert
(7, 8, 1, 1),   -- Admin Dashboard → Anna (not started yet)

-- Mobile Banking tasks
(9, 5, 1, 1),   -- Security Architecture → James
(9, 6, 1, 1),   -- Security Architecture → Lisa (DevOps)
(10, 5, 1, 1),  -- User Authentication → James
(10, 3, 1, 1),  -- User Authentication → Michael
(13, 6, 1, 1),  -- Push Notifications → Lisa

-- Analytics Dashboard tasks
(16, 4, 1, 1),  -- Dashboard Wireframes → Emily
(17, 9, 1, 1),  -- Data Pipeline → Robert
(17, 6, 1, 1),  -- Data Pipeline → Lisa
(18, 2, 1, 1),  -- Chart Components → Sarah
(18, 4, 1, 1),  -- Chart Components → Emily
(19, 3, 1, 1),  -- User Access Control → Michael
(20, 9, 1, 1);  -- Report Generation → Robert

-- Unassigned tasks: 4, 6, 8, 11, 12, 14, 15, 21, 22, 23, 24, 25
-- These are deliberately left unassigned to test auto-assignment

-- ============================================================
-- 9. DAILY WORK LOGS (Simulated past 10 days)
-- ============================================================
INSERT INTO `daily_work_log` (`task_id`, `user_id`, `log_date`, `status`, `work_completed`, `remaining_work`, `comments`, `hours_spent`) VALUES
-- Aug 12-21 logs for active tasks
-- Sarah on Design System (completed)
(1, 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'in-progress', 'Completed color palette and typography guide', 'Icon set and component library', NULL, 6.00),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'in-progress', 'Built base component library with 15 components', 'Responsive variants', NULL, 7.00),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'completed', 'Finalized all responsive variants and documentation', NULL, 'Design system is ready for dev handoff', 5.00),

-- Emily on Design System (completed)
(1, 4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'in-progress', 'Created wireframes for product listing and detail pages', 'Cart and checkout wireframes', NULL, 7.00),
(1, 4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'completed', 'Finished all wireframes and got PM approval', NULL, 'All designs exported to Figma', 6.00),

-- Michael on Product Catalog API
(2, 3, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'in-progress', 'Set up project structure and database models', 'CRUD endpoints', NULL, 8.00),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in-progress', 'Built CRUD endpoints for products', 'Search and filtering', NULL, 7.00),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'in-progress', 'Implemented search with Elasticsearch integration', 'Pagination and sorting', NULL, 6.00),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'in-progress', 'Added pagination, sorting, and category filters', 'Image upload and optimization', NULL, 7.00),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'in-progress', 'Working on image upload pipeline with S3', 'Caching layer', NULL, 5.00),

-- James on Product Catalog API
(2, 5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in-progress', 'Set up API rate limiting and input validation', 'Error handling middleware', NULL, 6.00),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'in-progress', 'Implemented error handling and logging middleware', 'API documentation', NULL, 7.00),

-- Sarah on Shopping Cart
(3, 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in-progress', 'Set up cart state management and basic add/remove', 'Quantity updates and price calc', NULL, 6.00),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'in-progress', 'Built quantity management and price calculation', 'Session persistence', NULL, 7.00),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'in-progress', 'Implementing session persistence with Redis', 'Guest cart merging', NULL, 6.00),

-- Michael on User Auth (E-Commerce)
(5, 3, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'in-progress', 'Set up JWT auth flow and user model', 'Password reset flow', NULL, 4.00),
(5, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in-progress', 'Built password reset with email verification', 'Profile management', NULL, 3.00),

-- Robert on User Auth (E-Commerce)
(5, 9, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'in-progress', 'Implemented profile management and order history API', 'Social login integration', NULL, 7.00),
(5, 9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'in-progress', 'Working on Google/Facebook social login', 'Session management', NULL, 6.00),
(5, 9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'in-progress', 'Completed social login and started session management', 'Testing and edge cases', NULL, 5.00),

-- James on Security Architecture (Banking - completed)
(9, 5, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'in-progress', 'Drafted security architecture document', 'Encryption standards', NULL, 8.00),
(9, 5, DATE_SUB(CURDATE(), INTERVAL 16 DAY), 'in-progress', 'Defined encryption standards and key management', 'Token management design', NULL, 7.00),
(9, 5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'completed', 'Finalized architecture doc with stakeholder approval', NULL, 'Ready for implementation', 6.00),

-- James on Banking User Authentication
(10, 5, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'in-progress', 'Started JWT implementation with refresh tokens', '2FA implementation', NULL, 7.00),
(10, 5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in-progress', 'Implemented 2FA with TOTP', 'Biometric auth bridge', NULL, 8.00),
(10, 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'in-progress', 'Working on biometric auth native module', 'Session management', NULL, 7.00),

-- Michael on Banking User Authentication
(10, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'in-progress', 'Built session management and device fingerprinting', 'Rate limiting for auth', NULL, 6.00),
(10, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'in-progress', 'Implementing rate limiting and brute force protection', 'Testing', NULL, 5.00),

-- Emily on Dashboard Wireframes (completed)
(16, 4, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'in-progress', 'Created initial wireframes for main dashboard', 'Detail views', NULL, 7.00),
(16, 4, DATE_SUB(CURDATE(), INTERVAL 16 DAY), 'completed', 'Finished all wireframes and got approval', NULL, 'Handoff to dev team', 5.00),

-- Robert on Data Pipeline
(17, 9, CURDATE(), 'in-progress', 'Set up ETL framework and data source connectors', 'Transformation rules', NULL, 7.00),

-- Lisa on Data Pipeline
(17, 6, CURDATE(), 'in-progress', 'Configured infrastructure for data pipeline deployment', 'Monitoring setup', NULL, 6.00),

-- Sarah on Chart Components
(18, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'in-progress', 'Built bar and line chart components with tooltips', 'Pie chart and heatmap', NULL, 8.00),
(18, 2, CURDATE(), 'in-progress', 'Working on pie chart component with drill-down', 'Heatmap component', NULL, 6.00),

-- Michael on User Access Control
(19, 3, CURDATE(), 'in-progress', 'Started role-based permission system', 'Data export permissions', NULL, 4.00);

-- ============================================================
-- 10. PROGRESS UPDATES (History)
-- ============================================================
INSERT INTO `progress_update` (`task_id`, `user_id`, `previous_progress`, `new_progress`, `notes`, `created_at`) VALUES
-- Design System progress
(1, 2, 0, 30, 'Color palette and typography done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 17:00:00')),
(1, 4, 30, 60, 'Wireframes completed', CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 17:30:00')),
(1, 2, 60, 85, 'Component library built', CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 17:00:00')),
(1, 4, 85, 95, 'All wireframes finalized', CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 17:30:00')),
(1, 2, 95, 100, 'Design system complete', CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 16:00:00')),

-- Product Catalog API progress
(2, 3, 0, 15, 'Project setup complete', CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 17:00:00')),
(2, 5, 15, 25, 'Validation and rate limiting added', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(2, 3, 25, 35, 'CRUD endpoints built', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:30:00')),
(2, 3, 35, 45, 'Search implemented', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(2, 5, 45, 50, 'Error handling done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:30:00')),
(2, 3, 50, 55, 'Pagination added', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),

-- Shopping Cart progress
(3, 2, 0, 10, 'Cart state management setup', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(3, 2, 10, 20, 'Quantity and price calc', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(3, 2, 20, 30, 'Session persistence WIP', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),

-- User Auth progress
(5, 3, 0, 20, 'JWT auth flow done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 17:00:00')),
(5, 3, 20, 35, 'Password reset built', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(5, 9, 35, 50, 'Profile management done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(5, 9, 50, 60, 'Social login WIP', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),
(5, 9, 60, 65, 'Social login completed', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),

-- Security Architecture progress
(9, 5, 0, 40, 'Architecture drafted', CONCAT(DATE_SUB(CURDATE(), INTERVAL 17 DAY), ' 17:00:00')),
(9, 5, 40, 75, 'Encryption standards done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 16 DAY), ' 17:00:00')),
(9, 5, 75, 100, 'Architecture approved', CONCAT(DATE_SUB(CURDATE(), INTERVAL 15 DAY), ' 16:00:00')),

-- Banking Auth progress
(10, 5, 0, 20, 'JWT with refresh tokens', CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 17:00:00')),
(10, 5, 20, 35, '2FA implemented', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(10, 5, 35, 45, 'Biometric auth WIP', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(10, 3, 45, 55, 'Session mgmt done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),
(10, 3, 55, 60, 'Rate limiting WIP', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),

-- Wireframes progress
(16, 4, 0, 60, 'Main dashboard wireframes', CONCAT(DATE_SUB(CURDATE(), INTERVAL 17 DAY), ' 17:00:00')),
(16, 4, 60, 100, 'All wireframes done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 16 DAY), ' 16:00:00')),

-- Data Pipeline progress
(17, 9, 0, 25, 'ETL framework setup', CONCAT(CURDATE(), ' 17:00:00')),
(17, 6, 25, 50, 'Infrastructure configured', CONCAT(CURDATE(), ' 17:30:00')),

-- Chart Components progress
(18, 2, 0, 40, 'Bar and line charts done', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(18, 2, 40, 70, 'Pie chart with drill-down', CONCAT(CURDATE(), ' 17:00:00')),

-- User Access Control progress
(19, 3, 0, 25, 'Permission system started', CONCAT(CURDATE(), ' 17:00:00'));

-- ============================================================
-- 11. TASK COMMENTS (PM notes)
-- ============================================================
INSERT INTO `task_comment` (`task_id`, `user_id`, `content`, `is_sticky`, `created_at`) VALUES
(2, 1, 'Great progress on the API. Make sure to add rate limiting before we go live.', 0, CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 10:00:00')),
(3, 1, 'Shopping cart needs to support guest checkout. Please plan for cart merging when guest signs up.', 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 14:00:00')),
(10, 1, 'This is our highest priority. Security must be bulletproof before we move to account management.', 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 09:00:00')),
(18, 1, 'Charts look great. Please ensure they are accessible (color-blind friendly palettes).', 0, CONCAT(CURDATE(), ' 11:00:00')),
(10, 5, 'Working on biometric auth native bridge. Should have it ready by end of week.', 0, CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:00:00')),
(2, 3, 'Image upload pipeline is more complex than estimated. May need an extra 2 days.', 0, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'));

-- ============================================================
-- 12. DAILY LOG COMPLIANCE
-- ============================================================
-- Simulate compliance for the past week (Aug 18-22)
INSERT INTO `daily_log_compliance` (`user_id`, `log_date`, `status`, `submitted_at`) VALUES
-- Sarah: logged every day
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:30:00')),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:15:00')),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:45:00')),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:20:00')),
(2, CURDATE(), 'logged', CONCAT(CURDATE(), ' 17:00:00')),

-- Michael: logged most days, missed one
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:30:00')),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 18:00:00')),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:15:00')),
(3, CURDATE(), 'logged', CONCAT(CURDATE(), ' 17:00:00')),

-- Emily: logged, missed today
(4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 16:45:00')),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:30:00')),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:50:00')),
(4, CURDATE(), 'missed', NULL),

-- James: logged most days
(5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')),
(5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:45:00')),
(5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'missed', NULL),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'late',   CONCAT(CURDATE(), ' 09:30:00')),
(5, CURDATE(), 'missed', NULL),

-- Lisa: logged
(6, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(6, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:00:00')),
(6, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),
(6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(6, CURDATE(), 'logged', CONCAT(CURDATE(), ' 17:30:00')),

-- David: no active tasks, not required
(7, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'not-required', NULL),
(7, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'not-required', NULL),
(7, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'not-required', NULL),
(7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'not-required', NULL),
(7, CURDATE(), 'not-required', NULL),

-- Anna: missed today
(8, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:00:00')),
(8, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:20:00')),
(8, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:10:00')),
(8, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'missed', NULL),
(8, CURDATE(), 'missed', NULL),

-- Robert: logged
(9, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:30:00')),
(9, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:15:00')),
(9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),
(9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'logged', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:45:00')),
(9, CURDATE(), 'logged', CONCAT(CURDATE(), ' 17:00:00'));

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================
INSERT INTO `notification` (`user_id`, `type`, `title`, `message`, `reference_type`, `reference_id`, `is_read`, `created_at`) VALUES
-- PM notifications
(1, 'risk_alert',           'Project At Risk: Mobile Banking App',    'Mobile Banking App has 2 tasks at risk of missing their deadlines. Review resource allocation.', 'project', 2, 0, CONCAT(CURDATE(), ' 09:00:00')),
(1, 'daily_log_warning',    'Missing Daily Logs',                     'Emily Davis and James Wilson have not submitted their daily progress updates for today.', NULL, NULL, 0, CONCAT(CURDATE(), ' 17:30:00')),
(1, 'task_status_changed',  'Task Completed: Design System',          'Sarah Johnson marked "Design System Implementation" as completed in E-Commerce Platform Redesign.', 'task', 1, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 16:05:00')),
(1, 'deadline_approaching', 'Deadline Approaching: Chart Components', 'Chart Components Library is due in 6 days (Aug 28) and is at 70% progress.', 'task', 18, 0, CONCAT(CURDATE(), ' 08:00:00')),
(1, 'comment_added',        'New Comment on Product Catalog API',     'Michael Chen commented: "Image upload pipeline is more complex than estimated."', 'task', 2, 0, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:05:00')),
(1, 'risk_alert',           'Overloaded Resource: James Wilson',      'James Wilson is allocated 47h this week across 2 projects, exceeding the 40h capacity.', 'user', 5, 0, CONCAT(CURDATE(), ' 08:30:00')),
(1, 'task_status_changed',  'Task Completed: Security Architecture',  'James Wilson completed "Security Architecture Design" in Mobile Banking App.', 'task', 9, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 15 DAY), ' 16:05:00')),
(1, 'general',              'Weekly Summary Available',               'Your weekly project summary is ready. 3 tasks completed, 2 at risk, 5 on track.', NULL, NULL, 0, CONCAT(CURDATE(), ' 07:00:00')),
(1, 'daily_log_warning',    'Consecutive Missed Logs: Anna Martinez', 'Anna Martinez has missed daily logs for 2 consecutive days (Aug 21-22). Consider reaching out.', 'user', 8, 0, CONCAT(CURDATE(), ' 18:00:00'));

-- ============================================================
-- 14. EMPLOYEE AVAILABILITY (Current week)
-- ============================================================
INSERT INTO `employee_availability` (`user_id`, `date`, `is_available`, `available_hours`, `day_type`) VALUES
-- All employees available Mon-Fri (Aug 18-22), off Sat-Sun
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (2, CURDATE(), 1, 8.00, 'weekday'),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (3, CURDATE(), 1, 8.00, 'weekday'),
(4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 7.00, 'weekday'), (4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 7.00, 'weekday'), (4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 7.00, 'weekday'), (4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 7.00, 'weekday'), (4, CURDATE(), 1, 7.00, 'weekday'),
(5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (5, CURDATE(), 1, 8.00, 'weekday'),
(6, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (6, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (6, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (6, CURDATE(), 1, 8.00, 'weekday'),
(7, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (7, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (7, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (7, CURDATE(), 1, 8.00, 'weekday'),
(8, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (8, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (8, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (8, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (8, CURDATE(), 1, 8.00, 'weekday'),
(9, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 8.00, 'weekday'), (9, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 8.00, 'weekday'), (9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 8.00, 'weekday'), (9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 8.00, 'weekday'), (9, CURDATE(), 1, 8.00, 'weekday'),
-- Weekend off
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend'),
(9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 0, 0.00, 'weekend'), (9, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 0, 0.00, 'weekend');

-- ============================================================
-- 15. LEAVE REQUESTS
-- ============================================================
INSERT INTO `leave_request` (`user_id`, `approved_by`, `leave_type`, `start_date`, `end_date`, `reason`, `status`) VALUES
(4, 1, 'planned', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Personal appointment', 'approved'),
(7, 1, 'casual',  DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Family event', 'approved'),
(8, NULL, 'sick', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'Not feeling well', 'pending');

-- ============================================================
-- 16. INVITE CODE
-- ============================================================
INSERT INTO `invite_code` (`org_id`, `code`, `created_by`, `max_uses`, `current_uses`, `is_active`, `expires_at`) VALUES
(1, 'TASKY2024', 1, 50, 8, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 131 DAY), ' 23:59:59'));

-- ============================================================
-- 17. REMOVED PM SETTINGS (No longer exists)
-- ============================================================

-- ============================================================
-- 18. UPDATE PROJECT PROGRESS (based on task averages)
-- ============================================================
-- E-Commerce: avg of tasks 1-8 = (100+55+30+0+65+0+0+0)/8 = 31.25
UPDATE `project` SET `progress` = 31.25 WHERE `id` = 1;
-- Mobile Banking: avg of tasks 9-15 = (100+60+0+0+0+0+0)/7 = 22.86
UPDATE `project` SET `progress` = 22.86 WHERE `id` = 2;
-- Analytics: avg of tasks 16-21 = (100+50+70+25+0+0)/6 = 40.83
UPDATE `project` SET `progress` = 40.83 WHERE `id` = 3;
-- Marketing: avg of tasks 22-25 = (0+0+0+0)/4 = 0
UPDATE `project` SET `progress` = 0.00 WHERE `id` = 4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA COMPLETE
-- ============================================================
-- Login Credentials:
-- PM:         pm@tasky.com / PM-001   / password123
-- Employee 1: sarah.j@tasky.com / EMP-001 / password123
-- Employee 2: michael.c@tasky.com / EMP-002 / password123
-- Employee 3: emily.d@tasky.com / EMP-003 / password123
-- Employee 4: james.w@tasky.com / EMP-004 / password123
-- Employee 5: lisa.a@tasky.com / EMP-005 / password123
-- Employee 6: david.b@tasky.com / EMP-006 / password123
-- Employee 7: anna.m@tasky.com / EMP-007 / password123
-- Employee 8: robert.k@tasky.com / EMP-008 / password123
