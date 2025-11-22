import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * A wrapper component that redirects to the login page if the user is not authenticated.
 * It also checks the required role (e.g., 'Admin')
 */
const PrivateRoute = ({ children, requiredRole }) => {
    const { isLoggedIn, user } = useContext(AuthContext);

    if (!isLoggedIn) {
        // User not logged in, redirect to the login page
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // User is logged in but doesn't have the required role
        // Redirect to a specific error/unauthorized page (or back to login)
        // We'll redirect to the login page for simplicity now.
        return <Navigate to="/" replace />;
    }

    // User is logged in and has the correct role, render the requested component
    return children;
};

export default PrivateRoute;