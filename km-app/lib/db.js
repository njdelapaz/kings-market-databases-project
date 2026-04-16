// script to connect with local mysql DB.

import mysql from 'mysql2/promise';

// async function to connect with local mysql DB.
// allows for single connections, but when we move to prod we can switch.


const db = await mysql.createConnection({

    // assign host, user, password, and database from .env file values.
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});


export default db;