// server/controllers/deptAdminController.js

// Import the specific handler functions from adminController
const { 
    createStudent, 
    createInstructor, 
    createCourse, 
    assignInstructor 
} = require('./adminController'); 

// Re-export the functions to be used in the router
module.exports = {
    createStudent,
    createInstructor,
    createCourse,
    assignInstructor
};