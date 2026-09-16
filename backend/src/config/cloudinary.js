// Cloudinary configuration
// Configures the Cloudinary SDK using credentials from .env.
// Every file that needs to upload/ delette images imports this
// configured instance, instead of each file setting up its own

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


module.exports = cloudinary;