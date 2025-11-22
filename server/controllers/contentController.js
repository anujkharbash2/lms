const pool = require('../db');

/**
 * Helper function to verify if the logged-in user (Instructor) 
 * is assigned to the given course.
 */
async function checkInstructorAssignment(course_id, instructor_id) {
    const [assignment] = await pool.query(
        'SELECT 1 FROM CourseAssignments WHERE course_id = ? AND instructor_id = ?',
        [course_id, instructor_id]
    );
    return assignment.length > 0;
}

// --- 1. LESSON Management ---

// POST /api/instructor/lessons
exports.createLesson = async (req, res) => {
    const { course_id, title, content, sequence_order } = req.body;
    const instructorId = req.user.id; // User ID from JWT token

    if (!course_id || !title || content === undefined || sequence_order === undefined) {
        return res.status(400).json({ message: 'Missing required fields for lesson creation.' });
    }

    try {
        // Step 1: Check Authorization
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this course.' });
        }

        // Step 2: Create Lesson
        const [result] = await pool.query(
            'INSERT INTO Lessons (course_id, title, content, sequence_order) VALUES (?, ?, ?, ?)',
            [course_id, title, content, sequence_order]
        );

        res.status(201).json({ 
            message: 'Lesson created successfully.',
            lessonId: result.insertId 
        });

    } catch (error) {
        console.error('Create Lesson Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A lesson with this title already exists in this course.' });
        }
        res.status(500).json({ message: 'Server error during lesson creation.' });
    }
};

// GET /api/instructor/lessons/:courseId
exports.getLessonsByCourse = async (req, res) => {
    const course_id = req.params.courseId;
    const instructorId = req.user.id; 

    try {
        // Step 1: Check Authorization
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: Not assigned to this course.' });
        }

        // Step 2: Fetch Lessons
        const [lessons] = await pool.query(
            'SELECT * FROM Lessons WHERE course_id = ? ORDER BY sequence_order ASC',
            [course_id]
        );
        res.status(200).json(lessons);

    } catch (error) {
        console.error('Get Lessons Error:', error);
        res.status(500).json({ message: 'Server error fetching lessons.' });
    }
};

// --- 2. ANNOUNCEMENT Management ---

// POST /api/instructor/announcements
exports.createAnnouncement = async (req, res) => {
    const { course_id, title, body } = req.body;
    const instructorId = req.user.id; 

    if (!course_id || !title || !body) {
        return res.status(400).json({ message: 'Missing course ID, title, or body for announcement.' });
    }

    try {
        // Step 1: Check Authorization
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this course.' });
        }

        // Step 2: Create Announcement
        const [result] = await pool.query(
            'INSERT INTO Announcements (course_id, instructor_id, title, body) VALUES (?, ?, ?, ?)',
            [course_id, instructorId, title, body]
        );

        res.status(201).json({ 
            message: 'Announcement posted successfully.',
            announcementId: result.insertId 
        });

    } catch (error) {
        console.error('Create Announcement Error:', error);
        res.status(500).json({ message: 'Server error posting announcement.' });
    }
};