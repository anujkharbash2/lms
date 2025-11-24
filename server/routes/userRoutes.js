const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const { 
    getInstructorCourses, 
    getStudentCourses,
    getStudentLessons, 
    getAnnouncementsByCourse,
    getCourseDetails // <--- IMPORT THIS
} = require('../controllers/userCourseController');

const { changePassword } = require('../controllers/profileController'); 

const router = express.Router();
router.use(protect); 

// Instructor Routes
router.get('/courses/instructor', restrictTo('Instructor'), getInstructorCourses);

// Student Routes
router.get('/courses/student', restrictTo('Student'), getStudentCourses);

// Content Routes
router.get('/content/lessons/:courseId', getStudentLessons); 
router.get('/content/announcements/:courseId', getAnnouncementsByCourse);

// 👇 NEW ROUTE FOR DETAILS
router.get('/content/course/:courseId/details', getCourseDetails); 

// Profile
router.post('/change-password', changePassword); 

module.exports = router;