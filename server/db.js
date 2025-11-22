// server/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections
    queueLimit: 0
}).promise(); // Use .promise() for async/await support

// Test connection and log success/failure
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('YYYYYYYYYYYYY MySQL Pool connected successfully!');
        connection.release();
    } catch (error) {
        console.error(' XXXXXXXXX Database Connection Failed:', error.message);
        // Exit process or handle error gracefully
    }
}

testDbConnection();

module.exports = pool;