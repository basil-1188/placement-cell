import { userModel,Blog } from "../models/userModel.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

export const getTeamProfile = async (req, res) => {
  try {
    const userId = req.user?._id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const user = await userModel.findById(userId, "name email role profileImage");
    if (!user) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    if (user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    console.log("Returning team profile data:", {
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });

    res.json({
      success: true,
      profileData: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("getTeamProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getTeamBlogs = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const blogs = await Blog.find({
      $or: [
        { status: "published" }, 
        { author: req.user._id, status: "draft" }, // Drafts by this training team member
      ],
    })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, message: "Blogs fetched successfully", data: blogs });
  } catch (error) {
    console.error("Error in getTeamBlogs:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const createTeamBlog = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    let imageUrl = "";
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file, "blogs", `${user._id}_blog_${Date.now()}`);
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ success: false, message: "Failed to upload image" });
      }
    }

    const blog = new Blog({
      title,
      content,
      author: req.user._id,
      status: "draft", // Explicitly set to "draft"
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",").map((tag) => tag.trim()) : [],
      image: imageUrl,
    });
    await blog.save();

    return res.status(201).json({ success: true, message: "Blog created successfully", data: blog });
  } catch (error) {
    console.error("Error in createTeamBlog:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const updateTeamBlog = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const { blogId } = req.params;
    const { title, content, status, tags } = req.body;

    let imageUrl;
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file, "blogs", `${user._id}_blog_${Date.now()}`);
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ success: false, message: "Failed to upload image" });
      }
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: req.user._id }, // Only update blogs authored by this user
      {
        title,
        content,
        status,
        tags: Array.isArray(tags) ? tags : tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
        image: imageUrl || undefined,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found or not authorized" });
    }

    return res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    console.error("Error in updateTeamBlog:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteTeamBlog = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const { blogId } = req.params;
    const blog = await Blog.findOneAndDelete({ _id: blogId, author: req.user._id });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found or not authorized" });
    }

    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTeamBlog:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};