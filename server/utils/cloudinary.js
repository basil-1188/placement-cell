import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param {Object} file - Multer file object
 * @param {string} folderType - "profile" for profile images, "resumes" for resumes
 * @param {string} [publicId] - Optional public ID for the file (e.g., user email or admnNo)
 * @returns {Promise<string>} - Secure URL of uploaded file
 */
export const uploadToCloudinary = (file, folderType, publicId = null) => {
  return new Promise((resolve, reject) => {
    let folderPath;
    let resourceType;

    if (folderType === "profile") {
      folderPath = "place-pro/profile";
      resourceType = "image";
    } else if (folderType === "resumes") {
      folderPath = "place-pro/resumes";
      resourceType = "raw";
    } else if (folderType === "blogs") {
      folderPath = "place-pro/blogs";
      resourceType = "image";
    } else {
      reject(new Error("Invalid folderType. Must be 'profile', 'resumes', or 'blogs'"));
      return;
    }

    const options = {
      resource_type: resourceType,
      folder: folderPath,
      public_id: publicId || `${file.originalname.split(".")[0]}_${Date.now()}`,
      overwrite: true,
      access_mode: "public",
    };

    console.log("Uploading file to Cloudinary:", {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: folderPath,
      public_id: options.public_id,
    });

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error.message);
          reject(new Error(`Failed to upload file to Cloudinary: ${error.message}`));
        } else {
          console.log("File uploaded to Cloudinary:", result.secure_url);
          resolve(result.secure_url);
        }
      })
      .end(file.buffer);
  });
};