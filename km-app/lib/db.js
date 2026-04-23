import mysql from 'mysql2/promise';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Hardcoding this temporarily to guarantee it uses the secure tunnel
  socketPath: '/cloudsql/kings-market-491600:us-east4:kings-market-db'
};

const db = mysql.createPool(dbConfig);

export default db;