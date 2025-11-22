const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const { 
    createLesson, 
    getLessonsByCourse, 
    createAnnouncement 
} = require('../controllers/contentController');

// 👇 IMPORT THE PROFILE CONTROLLER
const { 
    getEnrolledStudents, 
    updateInstructorProfile 
} = require('../controllers/profileController');

const router = express.Router();

// All routes require login AND Instructor role
router.use(protect, restrictTo('Instructor'));

// --- Lesson Management ---
router.post('/lessons', createLesson);
router.get('/lessons/:courseId', getLessonsByCourse);

// --- Announcement Management ---
router.post('/announcements', createAnnouncement);

// --- Student List & Profile Management ---
// 👇 THIS IS THE ROUTE YOU WERE MISSING OR HAD WRONG
router.get('/course/:courseId/students', getEnrolledStudents); 
router.put('/profile', updateInstructorProfile); 

module.exports = router;