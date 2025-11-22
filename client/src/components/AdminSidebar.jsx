import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/admin/dashboard', name: 'Dashboard' },
        { path: '/admin/departments', name: 'Departments & Faculties' }, // <-- NEW ITEM
        { path: '/admin/users', name: 'User Management' },
        { path: '/admin/courses', name: 'Course Management' },
    ];

    return (
        <div className="w-64 bg-gray-900 h-screen fixed top-0 left-0 flex flex-col text-gray-100 shadow-lg">
            <div className="p-6 text-2xl font-bold text-indigo-400 border-b border-gray-800 flex items-center gap-2">
                <span>🎓</span> LMS Admin
            </div>
            <nav className="flex-grow p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block py-3 px-4 rounded-lg transition duration-200 ${
                                        isActive 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition duration-200 shadow-sm"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
export default AdminSidebar;