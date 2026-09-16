// Upload middleware for handling image uploads with Cloudinary
//
// Multer handles the incoming file: it temporarily saves the uploaded
// image to the local "upload" folder on the server, giving our controller
// a file path to then ohand off to Cloudinary. We delete the temp files
// right after uploadig it to Cloudinary, so nothing piles up on disk.

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Temporary storage location for uploaded files
  },
  filename: (req, file, cb) => {
    // Unique filename so two uploads at the same second don't collide.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Append the original file extension);
  }
});

// Only allow actual image files - rejects PDFs, videos, etc
function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
}

const upload = multer({
    storage,
     fileFilter,
    limits: { fileSize: 5 * 1024 *1024}, // 5MB max
});

module.exports = upload;