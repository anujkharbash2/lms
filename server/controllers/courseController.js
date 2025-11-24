const pool = require('../db');
const { protect } = require('../middleware/authMiddleware'); // Not directly used here, but needed for context

// --- Helper function to find a user by loginId ---
async function getUserIdByLoginId(loginId) {
    const [user] = await pool.query('SELECT id FROM Users WHERE login_id = ?', [loginId]);
    return user.length > 0 ? user[0].id : null;
}

// --- 1. Course CRUD Operations ---

// POST /api/admin/courses
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Course title is required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Courses (title, description) VALUES (?, ?)',
            [title, description]
        );
        res.status(201).json({ 
            message: 'Course created successfully.', 
            courseId: result.insertId 
        });
    } catch (error) {
        console.error('Create Course Error:', error);
        // Check for duplicate title error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A course with this title already exists.' });
        }
        res.status(500).json({ message: 'Server error creating course.' });
    }
};

// GET /api/admin/courses
exports.getCourses = async (req, res) => {
    try {
        const [courses] = await pool.query('SELECT * FROM Courses ORDER BY created_at DESC');
        res.status(200).json(courses);
    } catch (error) {
        console.error('Get Courses Error:', error);
        res.status(500).json({ message: 'Server error fetching courses.' });
    }
};

// --- 2. Enrollment and Assignment Operations (Linking) ---

// POST /api/admin/courses/enroll
exports.enrollStudent = async (req, res) => {
    const { student_login_id, course_id } = req.body;

    if (!student_login_id || !course_id) {
        return res.status(400).json({ message: 'Student ID and Course ID are required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Get the student's internal user_id from their login_id
        const studentUserId = await getUserIdByLoginId(student_login_id);
        if (!studentUserId) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // 2. Check if the user is actually a student
        const [studentProfile] = await connection.query('SELECT user_id FROM Students WHERE user_id = ?', [studentUserId]);
        if (studentProfile.length === 0) {
            return res.status(403).json({ message: 'User is not a valid student profile.' });
        }
        
        // 3. Insert into CourseEnrollments table
        await connection.query(
            'INSERT INTO CourseEnrollments (student_id, course_id) VALUES (?, ?)',
            [studentUserId, course_id]
        );
        
        res.status(201).json({ message: 'Student successfully enrolled in course.' });

    } catch (error) {
        console.error('Enrollment Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Student is already enrolled in this course.' });
        }
        res.status(500).json({ message: 'Server error during enrollment.' });
    } finally {
        if (connection) connection.release();
    }
};

// POST /api/admin/courses/assign
exports.assignInstructor = async (req, res) => {
    const { instructor_login_id, course_id } = req.body;

    if (!instructor_login_id || !course_id) {
        return res.status(400).json({ message: 'Instructor ID and Course ID are required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Get the instructor's internal user_id from their login_id
        const instructorUserId = await getUserIdByLoginId(instructor_login_id);
        if (!instructorUserId) {
            return res.status(404).json({ message: 'Instructor not found.' });
        }

        // 2. Check if the user is actually an instructor
        const [instructorProfile] = await connection.query('SELECT user_id FROM Instructors WHERE user_id = ?', [instructorUserId]);
        if (instructorProfile.length === 0) {
            return res.status(403).json({ message: 'User is not a valid instructor profile.' });
        }

        // 3. Insert into CourseAssignments table
        await connection.query(
            'INSERT INTO CourseAssignments (instructor_id, course_id) VALUES (?, ?)',
            [instructorUserId, course_id]
        );
        
        res.status(201).json({ message: 'Instructor successfully assigned to course.' });

    } catch (error) {
        console.error('Assignment Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Instructor is already assigned to this course.' });
        }
        res.status(500).json({ message: 'Server error during assignment.' });
    } finally {
        if (connection) connection.release();
    }
};

// (Note: For brevity, CRUD for Update and Delete are omitted but follow the same pattern)