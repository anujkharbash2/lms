// server/db.js
const mysql = require('mysql2');
require('dotenv').config(); 

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Aiven uses custom ports!
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 👇 THIS IS THE FIX 👇
    ssl: {
        rejectUnauthorized: false 
    }
}).promise();

// Test connection
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Pool connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
    }
}

testDbConnection();

module.exports = pool;