import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({ departments: 0, users: 0, courses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await axios.get('https://lms-backend-lyf8.onrender.com/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };
    if (token) fetchStats();
  }, [token]);

  const DashboardCard = ({ title, count, icon, link, color }) => (
    <div 
        onClick={() => navigate(link)}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border-l-4"
        style={{ borderColor: color }}
    >
        <div className="flex justify-between items-center">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
            </div>
            <div className="text-4xl opacity-20" style={{ color: color }}>{icon}</div>
        </div>
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Departments" count={stats.departments} icon="🏢" link="/admin/departments" color="#4F46E5" />
        <DashboardCard title="Users" count={stats.users} icon="👥" link="/admin/users" color="#10B981" />
        <DashboardCard title="Courses" count={stats.courses} icon="📚" link="/admin/courses" color="#F59E0B" />
      </div>
    </AdminLayout>
  );
};
export default AdminDashboard;