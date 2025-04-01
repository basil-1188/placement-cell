import { userModel, Blog, StudyMaterial } from "../models/userModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getTeamProfile = async (req, res) => {
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
    console.log("Returning team profile data:", { name: user.name, email: user.email, role: user.role, profileImage: user.profileImage });
    res.json({ success: true, profileData: { name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    console.error("getTeamProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeamBlogs = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const blogs = await Blog.find({ $or: [{ status: "published" }, { author: req.user._id, status: "draft" }] })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, message: "Blogs fetched successfully", data: blogs });
  } catch (error) {
    console.error("Error in getTeamBlogs:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

const createTeamBlog = async (req, res) => {
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
      imageUrl = await uploadToCloudinary(req.file, "blogs", `${user._id}_blog_${Date.now()}`);
    }
    const blog = new Blog({
      title,
      content,
      author: req.user._id,
      status: "draft",
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

const updateTeamBlog = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const { blogId } = req.params;
    const { title, content, status, tags } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file, "blogs", `${user._id}_blog_${Date.now()}`);
    }
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: req.user._id },
      { title, content, status, tags: Array.isArray(tags) ? tags : tags ? tags.split(",").map((tag) => tag.trim()) : undefined, image: imageUrl || undefined, updatedAt: Date.now() },
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

const deleteTeamBlog = async (req, res) => {
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

const getMaterials = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const materials = await StudyMaterial.find({ $or: [{ status: "published" }, { author: req.user._id, status: "draft" }], type: "study_material" })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, message: "Materials fetched successfully", data: materials });
  } catch (error) {
    console.error("Error in getMaterials:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

const createMaterial = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const { title, description, tags } = req.body;
    let contentUrl, thumbnailUrl;

    if (req.files && req.files.file) {
      contentUrl = await uploadToCloudinary(req.files.file[0], "study-materials");
    } else {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    if (req.files && req.files.thumbnail) {
      thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0], "study-materials-thumbnails");
    }

    const material = new StudyMaterial({
      title,
      type: "study_material",
      content: contentUrl,
      author: req.user._id,
      description,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      thumbnail: thumbnailUrl || null, // Allow null if no thumbnail
    });

    await material.save();
    const populatedMaterial = await StudyMaterial.findById(material._id).populate("author", "name role");

    return res.status(201).json({ success: true, message: "Material created successfully", data: populatedMaterial });
  } catch (error) {
    console.error("Error in createMaterial:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }
    if (material.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own materials" });
    }
    const { title, description, tags, status } = req.body;
    if (req.files?.file) {
      material.content = await uploadToCloudinary(req.files.file[0], "study-materials", `${title || material.title}_${Date.now()}.pdf`);
    }
    if (req.files?.thumbnail) {
      material.thumbnail = await uploadToCloudinary(req.files.thumbnail[0], "study-materials/thumbnails", `${title || material.title}_thumb_${Date.now()}`);
    }
    material.title = title || material.title;
    material.description = description || material.description;
    material.tags = tags ? tags.split(",").map(tag => tag.trim()) : material.tags;
    material.status = status || material.status;
    await material.save();
    const updatedMaterial = await StudyMaterial.findById(material._id).populate("author", "name role");
    return res.status(200).json({ success: true, message: "Material updated successfully", data: updatedMaterial });
  } catch (error) {
    console.error("Error in updateMaterial:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }
    if (material.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own materials" });
    }
    await StudyMaterial.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMaterial:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export {
  getTeamProfile,
  getTeamBlogs,
  createTeamBlog,
  updateTeamBlog,
  deleteTeamBlog,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};