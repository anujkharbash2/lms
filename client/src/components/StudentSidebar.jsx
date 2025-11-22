import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-teal-900 h-screen fixed top-0 left-0 flex flex-col text-gray-100 shadow-lg">
            <div className="p-6 text-xl font-bold border-b border-teal-800">
                <span>🎓</span> Student Portal
                <div className="text-xs font-normal text-teal-300 mt-1">{user?.loginId}</div>
            </div>
            <nav className="flex-grow p-4">
                <ul className="space-y-2">
                    <li>
                        <NavLink 
                            to="/student/dashboard" 
                            className={({isActive}) => `block py-3 px-4 rounded hover:bg-teal-800 ${isActive ? 'bg-teal-700' : ''}`}
                        >
                            📚 My Courses
                        </NavLink>
                    </li>
                    {/* You can add Profile/Settings links here later */}
                </ul>
            </nav>
            <div className="p-4 border-t border-teal-800">
                <button 
                    onClick={() => { logout(); navigate('/'); }} 
                    className="w-full bg-red-500 hover:bg-red-600 py-2 rounded text-sm font-bold"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
export default StudentSidebar;