import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context
export const AuthContext = createContext();

// Define your backend URL
// const API_URL = 'http://localhost:5000/api/auth';
const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api/';
const API_URL = `${BASE_URL}/auth`;

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    // Check local storage for initial state
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 3. Login Function
    const login = async (loginId, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/login`, { loginId, password });
            
            const userData = res.data.user;
            const jwtToken = res.data.token;

            // Store in state and local storage
            setUser(userData);
            setToken(jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', jwtToken);
            
            setLoading(false);
            return userData.role; // Return role for redirection
            
        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || 'Login failed. Check credentials.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // 4. Logout Function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Redirect to login page will happen in the component
    };

    // 5. Context Value (What components can access)
    const contextValue = {
        user,
        token,
        loading,
        error,
        isLoggedIn: !!user,
        isMainAdmin: user?.role === 'Main_Admin',
        isInstructor: user?.role === 'Instructor',
        isStudent: user?.role === 'Student',
        isDeptAdmin: user?.role === 'Dept_Admin',
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};