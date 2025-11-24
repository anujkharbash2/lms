const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Import existing user course logic
const { 
    getInstructorCourses, 
    getStudentCourses,
    getStudentLessons, 
    getAnnouncementsByCourse 
} = require('../controllers/userCourseController');

// 👇 CRITICAL FIX: Import the new profile controller
const { changePassword } = require('../controllers/profileController'); 

const router = express.Router();

// All routes in this file require a valid login token
router.use(protect); 

// Instructor specific routes
router.get('/courses/instructor', restrictTo('Instructor'), getInstructorCourses);

// Student specific routes
router.get('/courses/student', restrictTo('Student'), getStudentCourses);

// Student Content Routes
router.get('/content/lessons/:courseId', getStudentLessons); 
router.get('/content/announcements/:courseId', getAnnouncementsByCourse);

// 👇 THIS LINE CAUSED THE CRASH (because changePassword was missing)
router.post('/change-password', changePassword); 

module.exports = router;