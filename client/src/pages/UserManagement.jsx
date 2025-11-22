import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

//const API_URL = 'http://localhost:5000/api/admin';

const BASE_URL = 'https://https://lms-backend-lyf8.onrender.com/api/';
const API_URL = `${BASE_URL}/admin`;


const UserManagement = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]); // Store list of depts
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');

    // Fetch Users AND Departments
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [userRes, deptRes] = await Promise.all([
                    axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/departments-list`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUsers(userRes.data);
                setDepartments(deptRes.data);
            } catch (error) {
                console.error('Data fetch error', error);
            }
        };
        fetchData();
    }, [token]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        
        let endpoint = '/students';
        if (selectedRole === 'Instructor') endpoint = '/instructors';
        if (selectedRole === 'Dept_Admin') endpoint = '/dept-admins';

        try {
            await axios.post(`${API_URL}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Success: ${selectedRole} created!`);
            // Refresh User List
            const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Failed'}`);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            
            {/* Create User Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Create New User</h2>
                {message && <p className="mb-4 text-red-600">{message}</p>}

                <div className="mb-4">
                    <label className="block font-bold mb-1">Role</label>
                    <select className="border p-2 rounded w-full" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Dept_Admin">Department Admin</option>
                    </select>
                </div>

                <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
    {/* 1. Common Fields */}
    <input name="password" type="password" placeholder="Temporary Password" onChange={handleInputChange} className="border p-2 rounded" required />
    
    <select name="dept_id" onChange={handleInputChange} className="border p-2 rounded" required>
        <option value="">-- Select Department --</option>
        {departments.length > 0 ? departments.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
        )) : <option disabled>No Departments Found</option>}
    </select>

    {/* 2. Student Fields */}
    {selectedRole === 'Student' && (
        <>
            <input name="full_name" placeholder="Full Name" onChange={handleInputChange} className="border p-2 rounded" required />
            <input name="program" placeholder="Program (e.g. M.Sc)" onChange={handleInputChange} className="border p-2 rounded" required />
            <input name="enrollment_number" placeholder="Enrollment No" onChange={handleInputChange} className="border p-2 rounded" required />
            <input name="email" type="email" placeholder="Email" onChange={handleInputChange} className="border p-2 rounded" required />
        </>
    )}

    {/* 3. Instructor Fields */}
    {selectedRole === 'Instructor' && (
        <input name="name" placeholder="Instructor Name" onChange={handleInputChange} className="border p-2 rounded" required />
    )}

    {/* 4. Dept Admin Fields - NOW REQUIRES NAME */}
    {selectedRole === 'Dept_Admin' && (
        <input name="name" placeholder="Admin Name (e.g. Dr. HOD)" onChange={handleInputChange} className="border p-2 rounded" required />
    )}

    <button className="col-span-2 bg-indigo-600 text-white py-2 rounded">Create User</button>
</form>
            </div>

            {/* User List Table */}
            <div className="bg-white p-6 rounded shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="p-2">ID</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{u.login_id}</td>
                                <td className="p-2">{u.role}</td>
                                <td className="p-2">{u.name}</td>
                                <td className="p-2 font-semibold text-gray-600">{u.department_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};
export default UserManagement;