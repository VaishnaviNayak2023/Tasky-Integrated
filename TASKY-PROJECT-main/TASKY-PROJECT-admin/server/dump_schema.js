import mysql from 'mysql2/promise';
import { dbConfig } from './db.config.js';

async function run() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [tables] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];

    for (const row of tables) {
      const tableName = row[tableKey];
      console.log(`\n--- TABLE: ${tableName} ---`);
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
      for (const col of columns) {
        console.log(
          `- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`,
        );
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await connection.end();
  }
}

run();
