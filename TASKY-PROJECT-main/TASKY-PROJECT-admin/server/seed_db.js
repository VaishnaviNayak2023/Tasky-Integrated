import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    multipleStatements: true,
  });

  try {
    console.log('Connected to DB');
    await connection.query('DROP DATABASE IF EXISTS tasky;');
    await connection.query('CREATE DATABASE tasky;');
    await connection.query('USE tasky;');
    console.log('Database tasky recreated.');

    const schemaPath = path.join(__dirname, '..', 'tasky_schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('Schema imported.');

    const seedPath = path.join(__dirname, 'seed_data.sql');
    const seedSql = await fs.readFile(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('Seed data imported.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

run();
