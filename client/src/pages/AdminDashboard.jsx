import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Configuration for the Dashboard Cards
  const adminActions = [
    { 
      title: "Departments & Faculties", 
      description: "Create units and assign Department Admins.", 
      icon: "🏢", 
      link: "/admin/departments", 
      color: "#4F46E5" // Indigo
    },
    { 
      title: "User Management", 
      description: "Register Students, Instructors, and Staff.", 
      icon: "👥", 
      link: "/admin/users", 
      color: "#10B981" // Emerald
    },
    { 
      title: "Course Management", 
      description: "Create courses, assign codes, and credits.", 
      icon: "📚", 
      link: "/admin/courses", 
      color: "#F59E0B" // Amber
    }
  ];

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, <span className="font-semibold text-indigo-600">{user?.loginId || 'Admin'}</span>. 
          Select a module below to manage the university system.
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {adminActions.map((action, index) => (
          <div 
            key={index}
            onClick={() => navigate(action.link)}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 group"
            style={{ borderColor: action.color }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition">
                <span className="text-4xl" role="img" aria-label={action.title}>
                  {action.icon}
                </span>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600">↗</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
              {action.title}
            </h3>
            <p className="text-sm text-gray-500">
              {action.description}
            </p>
          </div>
        ))}
      </div>

      {/* System Information / Static Panel */}
     
    </AdminLayout>
  );
};

export default AdminDashboard;