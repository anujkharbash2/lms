import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <StudentSidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                {children}
            </div>

            </div>
            
        </div>
    );
};

export default StudentLayout;