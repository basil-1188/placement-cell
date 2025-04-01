import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file, folderType, publicId = null) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer || !file.originalname) {
      return reject(new Error("Invalid file object provided"));
    }

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
    } else if (folderType === "study-materials") {
      folderPath = "place-pro/study-materials";
      resourceType = "raw";
    } else if (folderType === "study-materials-thumbnails") {
      folderPath = "place-pro/study-materials/thumbnails";
      resourceType = "image";
    } else if (folderType === "videos") {
      folderPath = "place-pro/videos";
      resourceType = "video";
    } else {
      console.error(`Invalid folderType received: ${folderType}`);
      reject(new Error("Invalid folderType"));
      return;
    }

    const baseName = file.originalname.replace(/\.[^/.]+$/, "");
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");

    const options = {
      resource_type: resourceType,
      folder: folderPath,
      public_id: publicId || `${sanitizedName}_${Date.now()}`,
      overwrite: true,
      access_mode: "public",
      attachment: false,
      format: folderType === "study-materials" ? "pdf" : undefined,
    };

    console.log("Uploading file to Cloudinary:", {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: folderPath,
      public_id: options.public_id,
      format: options.format,
    });

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error.message);
          reject(new Error(`Failed to upload file to Cloudinary: ${error.message}`));
        } else {
          console.log("File uploaded to Cloudinary:", result.secure_url);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration,
          });
        }
      })
      .end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = "video") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result === "ok") {
      console.log(`Successfully deleted from Cloudinary: ${publicId}`);
      return { success: true };
    } else {
      console.error(`Cloudinary deletion failed: ${result.result}`);
      throw new Error(`Failed to delete from Cloudinary: ${result.result}`);
    }
  } catch (error) {
    console.error("Error in deleteFromCloudinary:", error.message);
    throw new Error(`Cloudinary deletion error: ${error.message}`);
  }
};