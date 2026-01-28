/**
 * MySQL Database Connection
 * TODO (Commit-3): Set up mysql2 connection pool
 */

import mysql from 'mysql2/promise';

// TODO (Commit-3): Create connection pool
// export const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

console.log('Database module loaded (not yet connected)');
