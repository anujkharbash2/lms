// Function to generate a random 7-digit number as a string
function generateUniqueId() {
    // Generate a number between 1,000,000 and 9,999,999 (inclusive)
    const min = 1000000;
    const max = 9999999;
    
    // We will rely on the database UNIQUE constraint to handle true uniqueness
    // But this function ensures we get a valid 7-digit ID format.
    const uniqueId = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return String(uniqueId);
}

module.exports = {
    generateUniqueId
};