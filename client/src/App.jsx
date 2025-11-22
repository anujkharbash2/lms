import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import CourseManagement from './pages/CourseManagement';
import UserManagement from './pages/UserManagement';
import DepartmentManagement from './pages/DepartmentManagement'; // <-- NEW PAGE
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import InstructorCourseDetails from './pages/InstructorCourseDetails';
import StudentCourseDetails from './pages/StudentCourseDetails';
import DeptAdminDashboard from './pages/DeptAdminDashboard';
import DeptUserManagement from './pages/DeptUserManagement';
import DeptCourseManagement from './pages/DeptCourseManagement';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      
      {/* --- MAIN ADMIN ROUTES --- */}
      {/* Update requiredRole to 'Main_Admin' */}
      <Route 
        path="/admin/dashboard" 
        element={<PrivateRoute requiredRole="Main_Admin"><AdminDashboard /></PrivateRoute>} 
      />
      <Route 
        path="/admin/courses" 
        element={<PrivateRoute requiredRole="Main_Admin"><CourseManagement /></PrivateRoute>} 
      />
      <Route 
        path="/admin/users" 
        element={<PrivateRoute requiredRole="Main_Admin"><UserManagement /></PrivateRoute>} 
      />
      <Route 
        path="/admin/departments" // <-- NEW ROUTE
        element={<PrivateRoute requiredRole="Main_Admin"><DepartmentManagement /></PrivateRoute>} 
      />
      
      {/* --- DEPT ADMIN ROUTES --- */}
      

      {/* --- INSTRUCTOR ROUTES --- */}
      <Route 
        path="/instructor/dashboard" 
        element={<PrivateRoute requiredRole="Instructor"><InstructorDashboard /></PrivateRoute>} 
      />
      <Route 
        path="/instructor/course/:courseId" 
        element={<PrivateRoute requiredRole="Instructor"><InstructorCourseDetails /></PrivateRoute>} 
      />

      {/* --- STUDENT ROUTES --- */}
      <Route 
        path="/student/dashboard" 
        element={<PrivateRoute requiredRole="Student"><StudentDashboard /></PrivateRoute>} 
      />
      <Route 
        path="/student/course/:courseId" 
        element={<PrivateRoute requiredRole="Student"><StudentCourseDetails /></PrivateRoute>} 
      />
      <Route 
        path="/deptadmin/dashboard" 
        element={<PrivateRoute requiredRole="Dept_Admin"><DeptAdminDashboard /></PrivateRoute>} 
      />
      <Route 
        path="/deptadmin/users" // <-- NEW ROUTE
        element={<PrivateRoute requiredRole="Dept_Admin"><DeptUserManagement /></PrivateRoute>} 
      />
      <Route 
        path="/deptadmin/courses" // <-- NEW ROUTE
        element={<PrivateRoute requiredRole="Dept_Admin"><DeptCourseManagement /></PrivateRoute>} 
      />

      <Route path="*" element={<NotFound />} /> 
    </Routes>
  );
}
export default App;