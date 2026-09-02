export async function ensureSchema(pool) {
  const statements = [
    `ALTER TABLE user ADD COLUMN avatar VARCHAR(512) NULL`,
    `ALTER TABLE user ADD COLUMN points INT NOT NULL DEFAULT 0`,
    `ALTER TABLE user ADD COLUMN professional_role VARCHAR(100) NULL`,
    `ALTER TABLE user ADD COLUMN professional_role_other VARCHAR(255) NULL`,
    `ALTER TABLE user ADD COLUMN application_role VARCHAR(50) NULL`,
    `ALTER TABLE task ADD COLUMN resources_needed INT NOT NULL DEFAULT 1`,
    `ALTER TABLE task ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE task ADD COLUMN reviewer_id INT UNSIGNED NULL`,
    `ALTER TABLE task ADD COLUMN review_status VARCHAR(50) NULL`,
    `ALTER TABLE task ADD COLUMN completion_comment TEXT NULL`,
    `ALTER TABLE task ADD COLUMN review_comment TEXT NULL`,
    `ALTER TABLE task ADD COLUMN pm_final_comment TEXT NULL`,
    `CREATE TABLE IF NOT EXISTS task_subtask (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      task_id INT UNSIGNED NOT NULL,
      title VARCHAR(300) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'not-started',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_subtask_task (task_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS employee_daily_tracker (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      employee_id INT UNSIGNED NOT NULL,
      title VARCHAR(300) NOT NULL,
      description TEXT NULL,
      date DATE NOT NULL,
      progress DECIMAL(5,2) NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
      project_name VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_tracker_employee (employee_id),
      INDEX idx_tracker_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS task_review (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      task_id INT UNSIGNED NOT NULL,
      reviewer_id INT UNSIGNED NOT NULL,
      task_owner_id INT UNSIGNED NOT NULL,
      completion_comment TEXT NULL,
      review_comment TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_review_task (task_id),
      INDEX idx_review_reviewer (reviewer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (error) {
      if (error && (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR')) {
        continue;
      }
      console.warn('Schema ensure skipped:', error.code || error.message);
    }
  }
}

export async function safeCallProjectProgress(pool, projectId) {
  try {
    await pool.execute('CALL sp_update_project_progress(?)', [projectId]);
  } catch (error) {
    console.warn('sp_update_project_progress skipped:', error.message);
  }
}
