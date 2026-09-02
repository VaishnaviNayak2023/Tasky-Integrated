export async function createNotification(pool, { userId, type = 'general', title, message, referenceType = 'task', referenceId = null }) {
  if (!userId || !title || !message) return;
  try {
    await pool.execute(
      `INSERT INTO notification (user_id, type, title, message, reference_type, reference_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, referenceType, referenceId],
    );
  } catch (error) {
    console.warn('Notification insert failed:', error.message);
  }
}
