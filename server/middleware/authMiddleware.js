const jwt = require('jsonwebtoken');
const pool = require('../db'); 
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token validity
 */
const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; 
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

/**
 * Middleware to restrict access based on user role
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: Access restricted to ${roles.join(' or ')}s.` });
        }
        next();
    };
};

/**
 * Attaches the Dept ID to the request if the user is a Dept_Admin.
 */
const checkDepartmentOwnership = async (req, res, next) => {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'Dept_Admin') {
        try {
            const [dept] = await pool.query(
                'SELECT dept_id FROM Department_Admins WHERE user_id = ?',
                [userId]
            );
            
            if (dept.length > 0) {
                req.deptId = dept[0].dept_id; 
            } else {
                return res.status(403).json({ message: 'Dept Admin is not assigned to a unit.' });
            }
        } catch (error) {
            console.error('Dept Ownership Check Error:', error);
            return res.status(500).json({ message: 'Server error during ownership check.' });
        }
    }
    next(); 
};

// EXPORT ALL FUNCTIONS
module.exports = {
    protect,
    restrictTo,
    checkDepartmentOwnership 
};