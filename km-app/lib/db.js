import mysql from 'mysql2/promise';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (process.env.DB_SOCKET_PATH) {
  dbConfig.socketPath = process.env.DB_SOCKET_PATH;
  dbConfig.enableCleartextPlugin = true;
} else {
  const host = process.env.DB_HOST || '127.0.0.1';
  dbConfig.host = host;
  dbConfig.port = parseInt(process.env.DB_PORT || '3306', 10);
  // Local MySQL installs typically don't have SSL enabled; requesting TLS
  // there errors out with "Server does not support secure connection".
  // Only request TLS for remote hosts (e.g. Cloud SQL public IP).
  if (host !== '127.0.0.1' && host !== 'localhost') {
    dbConfig.ssl = { rejectUnauthorized: false };
  }
}

const db = mysql.createPool(dbConfig);

// Runs `fn` inside a single pooled connection wrapped in a transaction.
// Commits on success, rolls back on throw, and always releases the connection.
// The callback receives the raw connection so it can use row-level locks
// (e.g. `SELECT ... FOR UPDATE`) that must share a transaction.
export async function withTransaction(fn) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch { /* rollback attempt? */ }
    throw err;
  } finally {
    conn.release();
  }
}

export default db;