const pool = require('../db');
const bcrypt = require('bcrypt');
const { generateUniqueId } = require('../utils/authUtils');

// --- 1. Helper Function ---

async function createNewUser(req, res, role) {
    const { password, dept_id, ...profileData } = req.body; 

    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (!dept_id) return res.status(400).json({ message: 'Department ID is required.' });

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Generate ID
        let loginId;
        let isIdUnique = false;
        while (!isIdUnique) {
            loginId = generateUniqueId();
            const [existing] = await connection.query('SELECT login_id FROM Users WHERE login_id = ?', [loginId]);
            if (existing.length === 0) isIdUnique = true;
        }

        // Create Base User
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.query(
            'INSERT INTO Users (login_id, password_hash, role) VALUES (?, ?, ?)',
            [loginId, hashedPassword, role]
        );
        const userId = userResult.insertId;

        // Handle Roles
        if (role === 'Student') {
            const { full_name, program, branch, enrollment_number, section, email, phone, address } = profileData;
            await connection.query(
                `INSERT INTO Students (user_id, full_name, program, branch, enrollment_number, section, email, phone, address, dept_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, full_name, program, branch, enrollment_number, section, email, phone, address, dept_id]
            );
        } 
        else if (role === 'Instructor') {
            const { name, office_address } = profileData;
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
        res.status(201).json({ message: `${role} created.`, loginId, userId });

    } catch (error) {
        await connection?.rollback();
        console.error(`Create ${role} Error:`, error);
        res.status(500).json({ message: `Failed to create ${role}.`, error: error.message });
    } finally {
        if (connection) connection.release();
    }
}

// --- 2. Controller Functions ---

const createStudent = (req, res) => createNewUser(req, res, 'Student');
const createInstructor = (req, res) => createNewUser(req, res, 'Instructor');
const createDeptAdmin = (req, res) => createNewUser(req, res, 'Dept_Admin');

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
            WHERE u.role != 'Main_Admin' ORDER BY u.id DESC
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

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

const getAllDepartments = async (req, res) => {
    try {
        const [depts] = await pool.query('SELECT id, name, type FROM Departments_Faculties ORDER BY name');
        res.json(depts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments' });
    }
};

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

const createCourse = async (req, res) => {
    const deptId = req.deptId || req.body.dept_id || null; 
    const isDeptAdmin = req.user.role === 'Dept_Admin';
    const { title, description, course_code, credits, semester, program, course_type } = req.body;

    if (!title || !course_code) return res.status(400).json({ message: 'Title and Code are required.' });
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
        res.status(500).json({ message: 'Error creating course.' });
    }
};

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
 * Assigns Instructor to Course (Supports Dept Admin check).
 * THIS WAS MISSING and causing the crash!
 */
const assignInstructor = async (req, res) => {
    const { instructor_login_id, course_id } = req.body;
    const deptId = req.deptId || null;
    const isDeptAdmin = req.user.role === 'Dept_Admin';

    try {
        // 1. Get Instructor ID
        const [inst] = await pool.query('SELECT id FROM Users WHERE login_id = ?', [instructor_login_id]);
        if (inst.length === 0) return res.status(404).json({ message: 'Instructor not found.' });
        const instructorId = inst[0].id;

        // 2. If Dept Admin, verify the course belongs to their Dept
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

// --- 3. EXPORT EVERYTHING AT ONCE (Prevents undefined errors) ---
module.exports = {
    createNewUser,
    createStudent,
    createInstructor,
    createDeptAdmin,
    getAllUsers,
    getDashboardStats,
    getAllDepartments,
    createDepartmentFaculty,
    assignDeptAdmin,
    createCourse,
    getCoursesAdmin,
    assignInstructor // <--- This is now included!
};