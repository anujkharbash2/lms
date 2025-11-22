import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
    return (
        <div className="flex">
            <StudentSidebar />
            <div className="flex-grow ml-64 bg-gray-50 min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default StudentLayout;