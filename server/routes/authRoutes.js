const express = require('express');
const { registerAdmin, loginUser } = require('../controllers/authController');
const router = express.Router();

// Public route to set up the initial Admin user
router.post('/register/admin', registerAdmin);

// Universal login route for Admin, Instructor, and Student
router.post('/login', loginUser);

module.exports = router;