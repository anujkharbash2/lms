const pool = require('../db');
const bcrypt = require('bcrypt');
const { generateUniqueId } = require('../utils/authUtils');

// ==========================================
// 1. HELPER FUNCTION (Core Logic)
// ==========================================

/**
 * HELPER: Creates a new user (Student, Instructor, Dept_Admin).
 * Handles transactions, ID generation, and Department linking.
 */
async function createNewUser(req, res, role) {
    // Extract data
    let { password, dept_id, ...profileData } = req.body; 

    // 🔒 SMART SECURITY: If request comes from a Dept_Admin, force their own Dept ID
    // This prevents Dept Admin from creating users in other departments.
    if (req.deptId) {
        dept_id = req.deptId; 
    }

    // Basic Validation
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    
    // Dept ID is mandatory for Student/Instructor (Dept_Admin role creation might be by Main Admin)
    if (role !== 'Main_Admin' && !dept_id) {
        return res.status(400).json({ message: 'Department ID is required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Generate Unique 7-Digit ID
        let loginId;
        let isIdUnique = false;
        while (!isIdUnique) {
            loginId = generateUniqueId();
            const [existing] = await connection.query('SELECT login_id FROM Users WHERE login_id = ?', [loginId]);
            if (existing.length === 0) isIdUnique = true;
        }

        // 2. Create Base User (Login Credentials)
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.query(
            'INSERT INTO Users (login_id, password_hash, role) VALUES (?, ?, ?)',
            [loginId, hashedPassword, role]
        );
        const userId = userResult.insertId;

        // 3. Handle Specific Roles & Profile Tables
        if (role === 'Student') {
            const { full_name, program, branch, enrollment_number, section, email, phone, address } = profileData;
            if (!full_name || !email || !enrollment_number) throw new Error("Missing required student fields");

            await connection.query(
                `INSERT INTO Students (user_id, full_name, program, branch, enrollment_number, section, email, phone, address, dept_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, full_name, program, branch, enrollment_number, section, email, phone, address, dept_id]
            );
        } 
        else if (role === 'Instructor') {
            const { name, office_address } = profileData;
            if (!name) throw new Error("Missing required instructor field: name");

            await connection.query(
                'INSERT INTO Instructors (user_id, name, office_address, dept_id) VALUES (?, ?, ?, ?)',
                [userId, name, office_address, dept_id]
            );
        } 
        else if (role === 'Dept_Admin') {
            const { name } = profileData; 
            if (!name) throw new Error("Dept Admin Name is required");
            
            await connection.query(
                'INSERT INTO Department_Admins (dept_id, user_id, name) VALUES (?, ?, ?)',
                [dept_id, userId, name]
            );
        }

        await connection.commit();
        res.status(201).json({ message: `${role} created successfully.`, loginId, userId });

    } catch (error) {
        await connection?.rollback();
        console.error(`Create ${role} Error:`, error);
        res.status(500).json({ message: `Failed to create ${role}.`, error: error.message });
    } finally {
        if (connection) connection.release();
    }
}

// ==========================================
// 2. MAIN CONTROLLER FUNCTIONS
// ==========================================

// --- User Creation Wrappers ---
const createStudent = (req, res) => createNewUser(req, res, 'Student');
const createInstructor = (req, res) => createNewUser(req, res, 'Instructor');
const createDeptAdmin = (req, res) => createNewUser(req, res, 'Dept_Admin');

/**
 * Fetch All Users (For Main Admin - Global View)
 */
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT 
                u.id, u.login_id, u.role, 
                COALESCE(s.full_name, i.name, da.name, 'N/A') AS name, 
                COALESCE(df_s.name, df_i.name, df_da.name, 'Unassigned') AS department_name
            FROM Users u
            LEFT JOIN Students s ON u.id = s.user_id
            LEFT JOIN Instructors i ON u.id = i.user_id
            LEFT JOIN Department_Admins da ON u.id = da.user_id
            LEFT JOIN Departments_Faculties df_s ON s.dept_id = df_s.id
            LEFT JOIN Departments_Faculties df_i ON i.dept_id = df_i.id
            LEFT JOIN Departments_Faculties df_da ON da.dept_id = df_da.id
            WHERE u.role != 'Main_Admin' 
            ORDER BY u.id DESC
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

/**
 * Fetch Users for Specific Department (For Dept Admin)
 */
const getDeptUsers = async (req, res) => {
    const deptId = req.deptId; // From middleware
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.login_id, u.role, 
            COALESCE(s.full_name, i.name, 'N/A') AS name, 
            COALESCE(s.email, NULL) AS email,
            s.program, s.branch, s.enrollment_number
            FROM Users u
            LEFT JOIN Students s ON u.id = s.user_id
            LEFT JOIN Instructors i ON u.id = i.user_id
            WHERE (s.dept_id = ? OR i.dept_id = ?) 
            AND u.role != 'Main_Admin' 
            ORDER BY u.id DESC
        `, [deptId, deptId]);
        
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching department users.' });
    }
};

/**
 * Dashboard Statistics (Main Admin)
 */
const getDashboardStats = async (req, res) => {
    try {
        const [deptCount] = await pool.query('SELECT COUNT(*) as count FROM Departments_Faculties');
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM Users WHERE role != "Main_Admin"');
        const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM Courses');

        res.json({
            departments: deptCount[0].count,
            users: userCount[0].count,
            courses: courseCount[0].count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

/**
 * Fetch All Departments List
 */
const getAllDepartments = async (req, res) => {
    try {
        const [depts] = await pool.query('SELECT id, name, type FROM Departments_Faculties ORDER BY name');
        res.json(depts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments' });
    }
};

/**
 * Create New Department/Faculty
 */
const createDepartmentFaculty = async (req, res) => {
    const { name, type } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Departments_Faculties (name, type) VALUES (?, ?)', [name, type]);
        res.status(201).json({ message: `${type} created.`, deptId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already exists.' });
        res.status(500).json({ message: 'Error creating department.' });
    }
};

/**
 * Assign Dept Admin (Manual Method)
 */
const assignDeptAdmin = async (req, res) => {
    const { login_id, dept_id } = req.body; 
    if (!login_id || !dept_id) return res.status(400).json({ message: 'Login ID and Dept ID required.' });

    try {
        const [user] = await pool.query('SELECT id FROM Users WHERE login_id = ? AND role = ?', [login_id, 'Dept_Admin']);
        if (user.length === 0) return res.status(404).json({ message: 'User not found or not Dept_Admin.' });
        
        await pool.query('INSERT INTO Department_Admins (dept_id, user_id) VALUES (?, ?)', [dept_id, user[0].id]);
        res.status(201).json({ message: 'Assigned successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Assignment failed.' });
    }
};

/**
 * Create Course (Smart Logic for Dept Admin)
 */
const createCourse = async (req, res) => {
    const deptId = req.deptId || req.body.dept_id || null; 
    const isDeptAdmin = req.user.role === 'Dept_Admin';
    const { title, description, course_code, credits, semester, program, course_type } = req.body;

    if (!title || !course_code) return res.status(400).json({ message: 'Title and Code are required.' });
    
    // Security: Ensure Dept Admin can only create for their dept
    if (isDeptAdmin && !deptId) return res.status(403).json({ message: 'Dept verification failed.' });

    try {
        const [result] = await pool.query(
            `INSERT INTO Courses 
            (title, description, dept_id, course_code, credits, semester, program, course_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, deptId, course_code, credits, semester, program, course_type]
        );
        res.status(201).json({ message: 'Course created.', courseId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Course code already exists.' });
        res.status(500).json({ message: 'Error creating course.' });
    }
};

/**
 * Fetch All Courses (Admin View)
 */
const getCoursesAdmin = async (req, res) => {
    try {
        const [courses] = await pool.query(`
            SELECT c.*, df.name as dept_name 
            FROM Courses c
            LEFT JOIN Departments_Faculties df ON c.dept_id = df.id
            ORDER BY c.created_at DESC
        `);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses.' });
    }
};

/**
 * Assign Instructor to Course
 */
const assignInstructor = async (req, res) => {
    const { instructor_login_id, course_id } = req.body;
    const deptId = req.deptId || null;
    const isDeptAdmin = req.user.role === 'Dept_Admin';

    try {
        const [inst] = await pool.query('SELECT id FROM Users WHERE login_id = ?', [instructor_login_id]);
        if (inst.length === 0) return res.status(404).json({ message: 'Instructor not found.' });
        const instructorId = inst[0].id;

        if (isDeptAdmin) {
            const [course] = await pool.query('SELECT dept_id FROM Courses WHERE id = ?', [course_id]);
            if (course.length === 0) return res.status(404).json({ message: 'Course not found.' });
            if (course[0].dept_id !== deptId) return res.status(403).json({ message: 'Course does not belong to your department.' });
        }

        await pool.query('INSERT INTO CourseAssignments (instructor_id, course_id) VALUES (?, ?)', [instructorId, course_id]);
        res.status(201).json({ message: 'Instructor assigned.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

/**
 * Get Dept Info (For Dept Admin Dashboard)
 */
const getDeptAdminInfo = async (req, res) => {
    const deptId = req.deptId; 
    if (!deptId) return res.status(400).json({ message: 'No department ID found.' });

    try {
        const [dept] = await pool.query('SELECT id, name, type FROM Departments_Faculties WHERE id = ?', [deptId]);
        if (dept.length === 0) return res.status(404).json({ message: 'Department not found.' });
        res.json(dept[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};
/**
 * Returns the Department ID and Name managed by the logged-in Dept Admin.
 * Uses req.deptId set by the middleware.
 */

const getDeptCourses = async (req, res) => {
    const deptId = req.deptId; // From middleware
    try {
        const [courses] = await pool.query(`
            SELECT * FROM Courses 
            WHERE dept_id = ? 
            ORDER BY created_at DESC
        `, [deptId]);
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching department courses.' });
    }
};
/**
 * Enroll a Student in a Course (Dept Admin Locked)
 */
const enrollStudent = async (req, res) => {
    const { student_login_id, course_id } = req.body;
    const deptId = req.deptId || null; // From middleware
    const isDeptAdmin = req.user.role === 'Dept_Admin';

    try {
        // 1. Find Student
        const [student] = await pool.query('SELECT id, dept_id FROM Users LEFT JOIN Students ON Users.id = Students.user_id WHERE login_id = ?', [student_login_id]);
        
        if (student.length === 0) return res.status(404).json({ message: 'Student not found.' });
        const studentId = student[0].id;
        const studentDeptId = student[0].dept_id;

        // 2. Security Check: Does Student belong to this Dept?
        if (isDeptAdmin && studentDeptId !== deptId) {
            return res.status(403).json({ message: 'Cannot enroll a student from another department.' });
        }

        // 3. Security Check: Does Course belong to this Dept?
        if (isDeptAdmin) {
            const [course] = await pool.query('SELECT dept_id FROM Courses WHERE id = ?', [course_id]);
            if (course.length === 0) return res.status(404).json({ message: 'Course not found.' });
            if (course[0].dept_id !== deptId) return res.status(403).json({ message: 'Course does not belong to your department.' });
        }

        // 4. Enroll
        await pool.query('INSERT INTO CourseEnrollments (student_id, course_id) VALUES (?, ?)', [studentId, course_id]);
        res.status(201).json({ message: 'Student enrolled successfully.' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Student is already enrolled.' });
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ... 

// ADD TO EXPORTS at the very bottom:
module.exports = {
    // ... all previous exports ...
    enrollStudent // <--- ADD THIS
};

// ==========================================
// 3. EXPORT EVERYTHING (Single Source of Truth)
// ==========================================
module.exports = {
    createNewUser,
    createStudent,
    createInstructor,
    createDeptAdmin,
    getAllUsers,
    getDeptUsers, // <--- Added for Dept Admin User List
    getDashboardStats,
    getAllDepartments,
    createDepartmentFaculty,
    assignDeptAdmin,
    createCourse,
    getCoursesAdmin,
    assignInstructor,
    getDeptAdminInfo,
    getDeptCourses,
    enrollStudent
};