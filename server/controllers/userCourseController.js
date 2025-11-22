const pool = require('../db');

/**
 * Helper function to verify if the logged-in user (Student) 
 * is enrolled in the given course.
 */
async function checkStudentEnrollment(course_id, student_id) {
    const [enrollment] = await pool.query(
        'SELECT 1 FROM CourseEnrollments WHERE course_id = ? AND student_id = ?',
        [course_id, student_id]
    );
    return enrollment.length > 0;
}

/**
 * GET /api/user/courses/instructor
 * Fetches courses assigned to the logged-in Instructor (via JWT user ID).
 */
exports.getInstructorCourses = async (req, res) => {
    const instructorId = req.user.id; 

    try {
        const [courses] = await pool.query(`
            SELECT 
                c.id, c.title, c.description, c.course_code,
                COUNT(ce.student_id) AS enrolled_students_count
            FROM Courses c
            JOIN CourseAssignments ca ON c.id = ca.course_id
            LEFT JOIN CourseEnrollments ce ON c.id = ce.course_id
            WHERE ca.instructor_id = ?
            GROUP BY c.id, c.title, c.description
            ORDER BY c.title;
        `, [instructorId]);

        res.status(200).json(courses);
    } catch (error) {
        console.error('Get Instructor Courses Error:', error);
        res.status(500).json({ message: 'Server error fetching assigned courses.' });
    }
};

/**
 * GET /api/user/courses/student
 * Fetches courses the logged-in Student is enrolled in.
 */
exports.getStudentCourses = async (req, res) => {
    const studentId = req.user.id; 
    
    try {
        const [courses] = await pool.query(`
            SELECT 
                c.id, c.title, c.description, c.course_code,
                i.name AS instructor_name
            FROM Courses c
            JOIN CourseEnrollments ce ON c.id = ce.course_id
            LEFT JOIN CourseAssignments ca ON c.id = ca.course_id
            LEFT JOIN Instructors i ON ca.instructor_id = i.user_id
            WHERE ce.student_id = ?
            ORDER BY c.title;
        `, [studentId]);

        res.status(200).json(courses);
    } catch (error) {
        console.error('Get Student Courses Error:', error);
        res.status(500).json({ message: 'Server error fetching enrolled courses.' });
    }
};

/**
 * GET /api/user/content/lessons/:courseId
 * Fetches lessons for an enrolled student.
 */
exports.getStudentLessons = async (req, res) => {
    const course_id = req.params.courseId;
    const studentId = req.user.id; 

    try {
        // Step 1: Check Authorization (Enrollment Check)
        const isEnrolled = await checkStudentEnrollment(course_id, studentId);
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Forbidden: You are not enrolled in this course.' });
        }

        // Step 2: Fetch Lessons (FIXED: Added 'category' to SELECT)
        const [lessons] = await pool.query(
            'SELECT id, title, content, sequence_order, category FROM Lessons WHERE course_id = ? ORDER BY sequence_order ASC',
            [course_id]
        );
        res.status(200).json(lessons);

    } catch (error) {
        console.error('Get Student Lessons Error:', error);
        res.status(500).json({ message: 'Server error fetching lessons.' });
    }
};

/**
 * GET /api/user/content/announcements/:courseId
 * Fetches announcements for an enrolled student.
 */
exports.getAnnouncementsByCourse = async (req, res) => {
    const course_id = req.params.courseId;
    const studentId = req.user.id; 

    try {
        const isEnrolled = await checkStudentEnrollment(course_id, studentId);
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Forbidden: You are not enrolled in this course.' });
        }

        const [announcements] = await pool.query(`
            SELECT a.title, a.body, a.posted_at, i.name AS instructor_name
            FROM Announcements a
            JOIN Instructors i ON a.instructor_id = i.user_id
            WHERE a.course_id = ?
            ORDER BY a.posted_at DESC
        `, [course_id]);

        res.status(200).json(announcements);
    } catch (error) {
        console.error('Get Announcements Error:', error);
        res.status(500).json({ message: 'Server error fetching announcements.' });
    }
};

/**
 * GET /api/user/content/course/:courseId/details
 * Fetches Course Metadata + Assigned Instructor Profile
 */
exports.getCourseDetails = async (req, res) => {
    const courseId = req.params.courseId;
    const studentId = req.user.id;

    try {
        const isEnrolled = await checkStudentEnrollment(courseId, studentId);
        if (!isEnrolled) return res.status(403).json({ message: 'Not enrolled.' });

        const [rows] = await pool.query(`
            SELECT 
                c.title, c.course_code, c.description, c.credits, c.semester, c.program,
                i.name AS instructor_name, 
                i.contact_email AS instructor_email,
                i.office_address, 
                i.website, 
                i.bio
            FROM Courses c
            LEFT JOIN CourseAssignments ca ON c.id = ca.course_id
            LEFT JOIN Instructors i ON ca.instructor_id = i.user_id
            LEFT JOIN Users u ON i.user_id = u.id
            WHERE c.id = ?
        `, [courseId]);

        if (rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        res.json(rows[0]);

    } catch (error) {
        console.error("Get Course Details Error:", error);
        res.status(500).json({ message: 'Server error fetching details.' });
    }
};

// --- EXPORT ALL FUNCTIONS ---
// This is critical so routes/userRoutes.js can import them
module.exports = {
    getInstructorCourses: exports.getInstructorCourses,
    getStudentCourses: exports.getStudentCourses,
    getStudentLessons: exports.getStudentLessons,
    getAnnouncementsByCourse: exports.getAnnouncementsByCourse,
    getCourseDetails: exports.getCourseDetails
};