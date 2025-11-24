const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createLesson, getLessonsByCourse, getEnrolledStudents, createAnnouncement,updateInstructorProfile } = require('../controllers/contentController');
const router = express.Router();

// All routes in this file require a valid login AND the Instructor role
router.use(protect, restrictTo('Instructor'));

// --- Lesson Management ---
router.post('/lessons', createLesson);
router.get('/lessons/:courseId', getLessonsByCourse);

// --- Announcement Management ---
router.post('/announcements', createAnnouncement);
router.get('/course/:courseId/students', getEnrolledStudents); // <-- New
router.put('/profile', updateInstructorProfile); // <-- New

module.exports = router;