const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { 
    getInstructorCourses, 
    getStudentCourses,
    getStudentLessons, 
    getAnnouncementsByCourse 

} = require('../controllers/userCourseController');
const router = express.Router();

// All routes in this file require a valid login token (protect middleware)
router.use(protect); 

// Instructor specific routes
router.get('/courses/instructor', restrictTo('Instructor'), getInstructorCourses);

// Student specific routes
router.get('/courses/student', restrictTo('Student'), getStudentCourses);
// Student Content Routes (Accessible to ALL logged-in users, but checked for enrollment inside the controller)
router.get('/content/lessons/:courseId', getStudentLessons); 
router.get('/content/announcements/:courseId', getAnnouncementsByCourse); 
module.exports = router;