import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaDir = path.join(__dirname, 'schema');

const tables = ['users', 'worker_profiles', 'locations'];

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database initialization...\n');

    // Drop existing tables in reverse order of dependencies
    console.log('📋 Dropping existing tables...');
    try {
      await client.query('DROP TABLE IF EXISTS locations CASCADE');
      await client.query('DROP TABLE IF EXISTS worker_profiles CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      console.log('✅ Tables dropped\n');
    } catch (err) {
      console.log('ℹ️  No existing tables to drop\n');
    }

    // Create tables
    console.log('📦 Creating tables...');
    for (const table of tables) {
      const filePath = path.join(schemaDir, `${table}.sql`);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query(sql);
        console.log(`✅ Created ${table} table`);
      } else {
        console.warn(`⚠️  File not found: ${filePath}`);
      }
    }

    console.log('\n✨ Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Error Stack:', err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
