const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 👇 PATH FIX: Ensure we point to 'server/uploads'
// __dirname is 'server/middleware', so we go up one level (..) to 'server' then into 'uploads'
const uploadDir = path.join(__dirname, '../uploads'); 

// 👇 CRITICAL: Create the folder if it doesn't exist (Required for Render)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads directory at:", uploadDir);
}

// Configure Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter (Optional: Accept images, pdfs, docs)
const fileFilter = (req, file, cb) => {
    if(file.mimetype.match(/image|pdf|msword|officedocument|text/)) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;