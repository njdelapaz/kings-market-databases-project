import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:             process.env.DB_HOST,
  user:             process.env.DB_APP_USER     || process.env.DB_USER,
  password:         process.env.DB_APP_PASSWORD || process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  ssl: { rejectUnauthorized: false },
});

export default pool;