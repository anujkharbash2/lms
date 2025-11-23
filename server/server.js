const express = require('express');
const pool = require('./db'); 
const dotenv = require('dotenv');
const cors = require('cors'); 
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const deptAdminRoutes = require('./routes/deptAdminRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 👇 SERVE STATIC FILES (Crucial for accessing uploads)
// This tells Express: "If someone asks for /uploads/file.pdf, look in the 'uploads' folder"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.get('/', (req, res) => {
    res.status(200).send('LMS Backend is Running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/deptadmin', deptAdminRoutes);
app.use('/api/user', userRoutes);

// Database Test Route
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'Database Connection Successful', data: rows[0].solution });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Database Query Failed', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});