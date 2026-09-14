// src/services/cloudinary.js

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image file to Cloudinary using an unsigned upload preset.
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path (e.g. "mycare/avatars")
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = async (file, folder = "mycare/avatars") => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  // Validate file
  if (!file) {
    throw new Error("No file provided.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error("Image must be smaller than 2MB.");
  }

  // Build form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  // Upload
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  console.log("[Cloudinary] Uploading:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder,
  });

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Cloudinary] Upload failed:", errorText);
    throw new Error(`Upload failed (${response.status})`);
  }

  const data = await response.json();
  console.log("[Cloudinary] Upload successful:", {
    secure_url: data.secure_url,
    public_id: data.public_id,
    bytes: data.bytes,
    format: data.format,
  });

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
};

/**
 * Delete an image from Cloudinary by public_id.
 * ⚠️ IMPORTANT: Unsigned delete is NOT allowed by default in Cloudinary.
 * For secure deletion, this should be done from the backend with the API secret.
 * We're providing this stub so the frontend can trigger the request when backend is ready.
 */
export const deleteImage = async (publicId) => {
  console.warn(
    "[Cloudinary] Delete is not supported from the frontend (requires API secret). " +
      "Ask backend to delete via their API. publicId:",
    publicId
  );
  // Backend will eventually expose: DELETE /api/v1/uploads/:publicId
  // Or handle it as part of profile update
};

/**
 * Check if Cloudinary is properly configured.
 */
export const isCloudinaryConfigured = () => {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
};