const pool = require('../db');
const bcrypt = require('bcrypt');

// 1. Get Enrolled Students (For Instructor)
const getEnrolledStudents = async (req, res) => {
    const courseId = req.params.courseId;
    try {
        const [students] = await pool.query(`
            SELECT s.full_name, s.enrollment_number, s.email, u.login_id, ce.enrolled_date
            FROM CourseEnrollments ce
            JOIN Students s ON ce.student_id = s.user_id
            JOIN Users u ON s.user_id = u.id
            WHERE ce.course_id = ?
        `, [courseId]);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students' });
    }
};

// 2. Update Profile (Bio, Website - For Instructor)
const updateInstructorProfile = async (req, res) => {
    const userId = req.user.id;
    const { bio, website, contact_email, linked_in } = req.body;
    try {
        await pool.query(
            'UPDATE Instructors SET bio=?, website=?, contact_email=?, linked_in=? WHERE user_id=?',
            [bio, website, contact_email, linked_in, userId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// 3. Change Password (Universal)
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    try {
        // Get current hash
        const [users] = await pool.query('SELECT password_hash FROM Users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(currentPassword, users[0].password_hash);
        
        if (!match) return res.status(400).json({ message: 'Current password incorrect' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password_hash = ? WHERE id = ?', [newHash, userId]);
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

// EXPORT EVERYTHING
module.exports = {
    getEnrolledStudents,
    updateInstructorProfile,
    changePassword
};