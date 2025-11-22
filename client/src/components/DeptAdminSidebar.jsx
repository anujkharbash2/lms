import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeptAdminSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/deptadmin/dashboard', name: 'Dashboard' },
        { path: '/deptadmin/courses', name: 'My Courses' },
        { path: '/deptadmin/users', name: 'My Faculty & Students' },
    ];

    return (
        <div className="w-64 bg-indigo-900 h-screen fixed top-0 left-0 flex flex-col text-gray-100 shadow-lg">
            <div className="p-6 text-xl font-bold text-white border-b border-indigo-800">
                <span>🏛️</span> Dept Admin
                <div className="text-xs font-normal text-indigo-300 mt-1">ID: {user?.loginId}</div>
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
                                            ? 'bg-indigo-700 text-white shadow-md' 
                                            : 'hover:bg-indigo-800 text-gray-300 hover:text-white'
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-indigo-800">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg font-semibold transition duration-200 shadow-sm"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
export default DeptAdminSidebar;