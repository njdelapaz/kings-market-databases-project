// db/migrate.js — run with: node db/migrate.js
// Uses DB_MIGRATE_USER/DB_MIGRATE_PASSWORD if set, falls back to DB_USER/DB_PASSWORD.
/* eslint-disable @typescript-eslint/no-require-imports */

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

async function run() {
  loadEnvLocal();

  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST,
    user:               process.env.DB_MIGRATE_USER     || process.env.DB_USER,
    password:           process.env.DB_MIGRATE_PASSWORD || process.env.DB_PASSWORD,
    database:           process.env.DB_NAME,
    multipleStatements: true,
    ssl:                { rejectUnauthorized: false },
  });

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    const [applied] = await conn.query('SELECT name FROM schema_migrations');
    const appliedSet = new Set(applied.map(r => r.name));

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  skip  ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`  apply ${file} ...`);
      await conn.query(sql);
      await conn.execute('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      count++;
      console.log(`        done`);
    }

    console.log(`\nMigration complete. ${count} file(s) applied.`);
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
