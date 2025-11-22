const express = require('express');
const { protect, restrictTo, checkDepartmentOwnership } = require('../middleware/authMiddleware');

// Import Functions
const adminController = require('../controllers/adminController'); 

// DEBUGGING: If the server crashes, this will tell us EXACTLY which function is missing
if (!adminController.createNewUser) console.error("CRITICAL ERROR: createNewUser is undefined");
if (!adminController.createCourse) console.error("CRITICAL ERROR: createCourse is undefined");
if (!adminController.assignInstructor) console.error("CRITICAL ERROR: assignInstructor is undefined");
if (!adminController.getDeptAdminInfo) console.error("CRITICAL ERROR: getDeptAdminInfo is undefined");

const { 
    createNewUser, 
    createCourse, 
    assignInstructor,
    getDeptAdminInfo,
    getDeptUsers,
    getDeptCourses,
    enrollStudent
} = adminController;

const router = express.Router();

// Middleware
router.use(protect, restrictTo('Dept_Admin'));
router.use(checkDepartmentOwnership); 

// --- ROUTES ---
router.get('/test', (req, res) => {
    res.send('Dept Admin Router is Connected!');
});
// Dashboard Info
router.get('/info', getDeptAdminInfo); 

// User Management (Wrap helper in function to be safe)
router.post('/users/student', (req, res) => createNewUser(req, res, 'Student'));
router.post('/users/instructor', (req, res) => createNewUser(req, res, 'Instructor'));
router.get('/users', getDeptUsers);
// Course Management
router.post('/courses', createCourse); 
router.get('/courses', getDeptCourses);
router.post('/courses/assign-instructor', assignInstructor);
router.post('/courses/enroll', enrollStudent);

module.exports = router;