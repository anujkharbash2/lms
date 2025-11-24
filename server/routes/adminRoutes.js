// server/routes/adminRoutes.js

const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const { 
    createStudent, 
    createInstructor,
    createDeptAdmin, 
    getAllUsers,
    createDepartmentFaculty, 
    assignDeptAdmin,         
    createCourse,
    getDashboardStats, 
    getAllDepartments,
    getCoursesAdmin            
} = require('../controllers/adminController'); 

const { 
    // getCourses, // <-- Remove this, we use getCoursesAdmin instead
    enrollStudent, 
    assignInstructor,
} = require('../controllers/courseController'); 

const router = express.Router();

// All routes in this file must be protected and restricted to the Main_Admin role
router.use(protect, restrictTo('Main_Admin'));

// --- Dashboard & Data ---
router.get('/stats', getDashboardStats);
router.get('/departments-list', getAllDepartments);

// --- User Management Routes ---
router.post('/students', createStudent);
router.post('/instructors', createInstructor);
router.post('/dept-admins', createDeptAdmin);
router.get('/users', getAllUsers);

// --- Course Management Routes ---
router.post('/courses', createCourse);
router.get('/courses', getCoursesAdmin); // <-- CORRECTED: Use the Admin specific fetcher

// Enrollment/Assignment
router.post('/courses/enroll', enrollStudent);
router.post('/courses/assign', assignInstructor);

// --- Department/Faculty Management Routes ---
router.post('/departments', createDepartmentFaculty);
router.post('/departments/assign-admin', assignDeptAdmin);

module.exports = router;