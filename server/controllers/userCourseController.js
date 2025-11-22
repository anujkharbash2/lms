const pool = require('../db');

/**
 * GET /api/user/courses/instructor
 * Fetches courses assigned to the logged-in Instructor (via JWT user ID).
 */
exports.getInstructorCourses = async (req, res) => {
    // req.user is set by the 'protect' middleware (Step 4)
    const instructorId = req.user.id; 

    try {
        const [courses] = await pool.query(`
            SELECT 
                c.id, c.title, c.description,
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
    // req.user is set by the 'protect' middleware (Step 4)
    const studentId = req.user.id; 
    
    try {
        const [courses] = await pool.query(`
            SELECT 
                c.id, c.title, c.description,
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

        // Step 2: Fetch Lessons
        const [lessons] = await pool.query(
            'SELECT id, title, content, sequence_order FROM Lessons WHERE course_id = ? ORDER BY sequence_order ASC',
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
        // Step 1: Check Authorization (Enrollment Check)
        const isEnrolled = await checkStudentEnrollment(course_id, studentId);
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Forbidden: You are not enrolled in this course.' });
        }

        // Step 2: Fetch Announcements
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