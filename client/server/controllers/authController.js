// server/controllers/authController.js

const pool = require('../db'); // The MySQL pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUniqueId } = require('../utils/authUtils');

// Secret for signing JWT tokens (Reads from .env)
const JWT_SECRET = process.env.JWT_SECRET; 

// --- 1. MAIN_ADMIN REGISTRATION ---
async function registerAdmin(req, res) {
    const { password } = req.body;
    
    // NOTE: This endpoint is for initial setup only. 
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if any Main_Admin already exists (Limit 1 Main Admin for setup)
        // ROLE CHANGE 1: Checking for 'Main_Admin' role
        const [adminCount] = await connection.query('SELECT COUNT(*) AS count FROM Users WHERE role = ?', ['Main_Admin']);
        if (adminCount[0].count > 0) {
            return res.status(403).json({ message: 'Main Admin user already registered.' });
        }

        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 2. Generate a login ID (it must be unique, so we re-try if necessary, although unlikely)
        let loginId;
        let isIdUnique = false;
        
        while (!isIdUnique) {
            loginId = generateUniqueId();
            const [existingId] = await connection.query('SELECT login_id FROM Users WHERE login_id = ?', [loginId]);
            if (existingId.length === 0) {
                isIdUnique = true;
            }
        }

        
        
        // 3. Insert the new Admin into the Users table
        // ROLE CHANGE 2: Inserting the user with 'Main_Admin' role
        const [result] = await connection.query(
            'INSERT INTO Users (login_id, password_hash, role) VALUES (?, ?, ?)',
            [loginId, hashedPassword, 'Main_Admin']
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            message: 'Main Admin registered successfully.',
            loginId: loginId // IMPORTANT: Admin needs this ID to log in!
        });

    } catch (error) {
        await connection?.rollback();
        console.error('Main Admin Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    } finally {
        if (connection) connection.release();
    }
}

// --- 2. UNIVERSAL LOGIN FUNCTION ---
// This function remains unchanged as it dynamically fetches the user's role 
// (Main_Admin, Dept_Admin, Instructor, or Student) from the DB.
async function loginUser(req, res) {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
        return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Find the user by login_id
        const [users] = await connection.query('SELECT * FROM Users WHERE login_id = ?', [loginId]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate a JSON Web Token (JWT)
        const token = jwt.sign(
            { id: user.id, loginId: user.login_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                loginId: user.login_id,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    registerAdmin, // Note: This function now registers the Main_Admin
    loginUser
};