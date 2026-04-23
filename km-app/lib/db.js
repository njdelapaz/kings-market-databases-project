import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  user:             process.env.DB_APP_USER     || process.env.DB_USER,
  password:         process.env.DB_APP_PASSWORD || process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  ...(process.env.INSTANCE_UNIX_SOCKET
    ? { socketPath: process.env.INSTANCE_UNIX_SOCKET }
    : { host: process.env.DB_HOST, ssl: { rejectUnauthorized: false } }),
  waitForConnections: true,
  connectionLimit:    10,
});

export default pool;