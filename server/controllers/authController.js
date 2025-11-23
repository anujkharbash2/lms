const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUniqueId } = require('../utils/authUtils');

const JWT_SECRET = process.env.JWT_SECRET; 

// --- 1. MAIN_ADMIN REGISTRATION (Keep as is) ---
async function registerAdmin(req, res) {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [adminCount] = await connection.query('SELECT COUNT(*) AS count FROM Users WHERE role = ?', ['Main_Admin']);
        if (adminCount[0].count > 0) return res.status(403).json({ message: 'Main Admin already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        let loginId;
        let isIdUnique = false;
        
        while (!isIdUnique) {
            loginId = generateUniqueId();
            const [existingId] = await connection.query('SELECT login_id FROM Users WHERE login_id = ?', [loginId]);
            if (existingId.length === 0) isIdUnique = true;
        }

        await connection.query(
            'INSERT INTO Users (login_id, password_hash, role) VALUES (?, ?, ?)',
            [loginId, hashedPassword, 'Main_Admin']
        );
        
        await connection.commit();
        res.status(201).json({ message: 'Main Admin registered.', loginId });

    } catch (error) {
        await connection?.rollback();
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (connection) connection.release();
    }
}

// --- 2. LOGIN FUNCTION (UPDATED TO FETCH NAMES) ---
async function loginUser(req, res) {
    const { loginId, password } = req.body;

    if (!loginId || !password) return res.status(400).json({ message: 'Missing credentials.' });

    try {
        // 1. Verify User Exists
        const [users] = await pool.query('SELECT * FROM Users WHERE login_id = ?', [loginId]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

        const user = users[0];

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

        // 3. FETCH REAL NAME based on Role
        let realName = 'User';
        
        if (user.role === 'Student') {
            const [profile] = await pool.query('SELECT full_name FROM Students WHERE user_id = ?', [user.id]);
            if (profile.length > 0) realName = profile[0].full_name;
        } 
        else if (user.role === 'Instructor') {
            const [profile] = await pool.query('SELECT name FROM Instructors WHERE user_id = ?', [user.id]);
            if (profile.length > 0) realName = profile[0].name;
        }
        else if (user.role === 'Dept_Admin') {
            const [profile] = await pool.query('SELECT name FROM Department_Admins WHERE user_id = ?', [user.id]);
            if (profile.length > 0) realName = profile[0].name;
        }
        else if (user.role === 'Main_Admin') {
            realName = 'Administrator';
        }

        // 4. Generate Token
        const token = jwt.sign(
            { id: user.id, loginId: user.login_id, role: user.role, name: realName }, // Include Name in Token
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 5. Send Response
        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                loginId: user.login_id,
                role: user.role,
                name: realName // <--- SEND NAME TO FRONTEND
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
}

module.exports = { registerAdmin, loginUser };