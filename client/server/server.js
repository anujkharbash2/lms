// server/server.js
const express = require('express');
const pool = require('./db'); // Import the database pool
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
 // Essential for connecting frontend/backend
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deptAdminRoutes = require('./routes/deptAdminRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows frontend (port 3000) to communicate with backend (port 5000)
app.use(express.json()); // Allows parsing of JSON request bodies

// --- ROUTES ---

// 1. Basic Test Route
app.get('/', (req, res) => {
    res.status(200).send('LMS Backend is Running!');
});

// 2. Authentication Routes
app.use('/api/auth', authRoutes);

// 3. Admin Management Routes (Protected)
app.use('/api/admin', adminRoutes);

// 4. Instructor Specific Routes (Content Management)
app.use('/api/instructor', instructorRoutes);

// 5. Department Admin Routes
app.use('/api/deptadmin', deptAdminRoutes);

// General user routes
app.use('/api/user', userRoutes);

// 2. Database Test Route
app.get('/test-db', async (req, res) => {
    try {
        // Example query to verify connection and data
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            status: 'Database Connection Successful',
            data: rows[0].solution
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 'Database Query Failed', 
            error: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`YYYYYYY Server running on port YYYYYY${PORT}`);
});