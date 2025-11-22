// server/routes/deptAdminRoutes.js

const express = require('express');
const { protect, restrictTo, checkDepartmentOwnership } = require('../middleware/authMiddleware');

// Import ONLY the necessary helper function and course handlers
const { 
    createNewUser, // <-- IMPORT THE RAW HELPER FUNCTION
    createCourse, 
    assignInstructor 
} = require('../controllers/adminController'); 

const router = express.Router();

// 1. All routes require login and the Dept_Admin role
router.use(protect, restrictTo('Dept_Admin'));
// 2. All routes check for the managed department ID and attach it to req.deptId
router.use(checkDepartmentOwnership); 

// --- User Management (CRASH FIX IMPLEMENTED HERE) ---
// We wrap the helper in an arrow function, forcing Express to receive a valid handler.
router.post('/users/student', (req, res) => createNewUser(req, res, 'Student')); // <-- FIX: Guaranteed Function
router.post('/users/instructor', (req, res) => createNewUser(req, res, 'Instructor')); // <-- FIX: Guaranteed Function

// --- Course Management ---
router.post('/courses', createCourse); 
router.post('/courses/assign-instructor', assignInstructor);

module.exports = router;