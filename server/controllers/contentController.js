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

exports.createLesson = async (req, res) => {
    // Multer puts text fields in req.body and file in req.file
    const { course_id, title, content, sequence_order, category, external_link } = req.body;
    
    // If a file was uploaded, create the URL path; otherwise null
    const file_url = req.file ? `/uploads/${req.file.filename}` : null; 
    
    const instructorId = req.user.id;

    if (!course_id || !title) return res.status(400).json({ message: 'Missing required fields.' });

    try {
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) return res.status(403).json({ message: 'Forbidden' });

        const [result] = await pool.query(
            `INSERT INTO Lessons 
            (course_id, title, content, sequence_order, category, file_url, external_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course_id, title, content, sequence_order, category || 'Other', file_url, external_link]
        );

        res.status(201).json({ message: 'Lesson created.', lessonId: result.insertId });
    } catch (error) {
        console.error('Create Lesson Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.getLessonsByCourse = async (req, res) => {
    const course_id = req.params.courseId;
    const instructorId = req.user.id; 

    try {
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) return res.status(403).json({ message: 'Forbidden' });

        const [lessons] = await pool.query(
            'SELECT * FROM Lessons WHERE course_id = ? ORDER BY sequence_order ASC',
            [course_id]
        );
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// --- 2. ANNOUNCEMENT Management ---

exports.createAnnouncement = async (req, res) => {
    const { course_id, title, body, external_link } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const instructorId = req.user.id;

    if (!course_id || !title || !body) return res.status(400).json({ message: 'Missing fields.' });

    try {
        const isAssigned = await checkInstructorAssignment(course_id, instructorId);
        if (!isAssigned) return res.status(403).json({ message: 'Forbidden' });

        const [result] = await pool.query(
            `INSERT INTO Announcements 
            (course_id, instructor_id, title, body, file_url, external_link) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [course_id, instructorId, title, body, file_url, external_link]
        );

        res.status(201).json({ message: 'Announcement posted.', announcementId: result.insertId });
    } catch (error) {
        console.error('Create Announcement Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};