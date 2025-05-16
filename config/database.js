const mysql = require("mysql2/promise");

// Create the connection pool. The pool-specific settings are the defaults
const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_UNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: 'Asia/Jakarta',
  allowPublicKeyRetrieval: true, 
});

module.exports = database;