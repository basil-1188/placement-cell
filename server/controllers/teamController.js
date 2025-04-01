import { userModel, Blog, StudyMaterial,Video } from "../models/userModel.js";
import { uploadToCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";

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
    console.log("Returning team profile data:", { name: user.name, email: user.email, role: user.role, profileImage: user.profileImage });
    res.json({ success: true, profileData: { name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } });
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
    const blogs = await Blog.find({ $or: [{ status: "published" }, { author: req.user._id, status: "draft" }] })
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

export const getMaterials = async (req, res) => {
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

export const createMaterial = async (req, res) => {
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
      thumbnail: thumbnailUrl || null,
    });

    await material.save();
    const populatedMaterial = await StudyMaterial.findById(material._id).populate("author", "name role");

    return res.status(201).json({ success: true, message: "Material created successfully", data: populatedMaterial });
  } catch (error) {
    console.error("Error in createMaterial:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const updateMaterial = async (req, res) => {
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

export const deleteMaterial = async (req, res) => {
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

export const uploadVideos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    const { title, youtubeUrl, description, tags } = req.body;
    const maxDuration = 600;

    if (youtubeUrl) {
      if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
        return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
      }

      let durationSeconds;
      try {
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0] || youtubeUrl.split("/")[3];
        const apiKey = process.env.YOUTUBE_API_KEY;
        const response = await axios.get(
          `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`
        );
        const durationISO = response.data.items[0]?.contentDetails.duration;
        durationSeconds = durationISO ? parseISO8601Duration(durationISO) : undefined;
      } catch (error) {
        console.warn("Could not fetch YouTube duration:", error.message);
      }

      if (durationSeconds > maxDuration) {
        return res.status(400).json({
          success: false,
          message:
            "Video exceeds 10 minutes. Please reduce the duration to 10 minutes or less. If the topic is incomplete, split it into multiple ≤10-minute parts (e.g., 'Topic 1 - Part 1', 'Topic 1 - Part 2') and upload separately.",
        });
      }

      const video = new Video({
        title,
        type: "video",
        content: youtubeUrl,
        source: "youtube",
        duration: durationSeconds,
        description,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        author: req.user._id,
      });
      await video.save();
      return res.status(201).json({ success: true, message: "Video uploaded successfully", data: video });
    } else {
      const files = [];
      if (req.files?.file0?.[0]) files.push(req.files.file0[0]);
      if (req.files?.file1?.[0]) files.push(req.files.file1[0]);
      if (req.files?.file2?.[0]) files.push(req.files.file2[0]);

      if (files.length === 0) {
        return res.status(400).json({ success: false, message: "At least one video file or YouTube URL required" });
      }

      const uploadResults = await Promise.all(files.map((file) => uploadToCloudinary(file, "videos")));
      for (const result of uploadResults) {
        if (result.duration > maxDuration) {
          await Promise.all(uploadResults.map((r) => deleteFromCloudinary(r.public_id, "video")));
          return res.status(400).json({
            success: false,
            message: "One or more videos exceed 10 minutes. Please reduce each part to 10 minutes or less.",
          });
        }
      }

      const totalDuration = uploadResults.reduce((sum, r) => sum + r.duration, 0); // Sum durations

      const video = new Video({
        title,
        type: "video",
        content: uploadResults.map((r) => r.url).join(","),
        publicIds: uploadResults.map((r) => r.public_id),
        source: "upload",
        duration: totalDuration,
        description,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        author: req.user._id,
      });
      await video.save();
      return res.status(201).json({ success: true, message: "Video uploaded successfully", data: video });
    }
  } catch (error) {
    console.error("Error in uploadVideos:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getVideos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const videos = await Video.find({ $or: [{ status: "published" }, { author: req.user._id, status: "draft" }] })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, message: "Videos fetched successfully", data: videos });
  } catch (error) {
    console.error("Error in getVideos:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    if (video.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own videos" });
    }

    const { title, youtubeUrl, description, tags, status } = req.body;
    const maxDuration = 600;

    let content = video.content;
    let publicIds = video.publicIds || [];
    let source = video.source;
    let duration = video.duration;

    if (youtubeUrl) {
      if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
        return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
      }
      content = youtubeUrl;
      source = "youtube";
      if (video.source === "upload" && video.publicIds.length > 0) {
        await Promise.all(video.publicIds.map((id) => deleteFromCloudinary(id, "video")));
      }
      publicIds = [];
      try {
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0] || youtubeUrl.split("/")[3];
        const apiKey = process.env.YOUTUBE_API_KEY;
        const response = await axios.get(
          `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`
        );
        const durationISO = response.data.items[0]?.contentDetails.duration;
        duration = durationISO ? parseISO8601Duration(durationISO) : undefined;
      } catch (error) {
        console.warn("Could not fetch YouTube duration:", error.message);
      }
      if (duration > maxDuration) {
        return res.status(400).json({
          success: false,
          message:
            "Video exceeds 10 minutes. Please reduce the duration to 10 minutes or less. If the topic is incomplete, split it into multiple ≤10-minute parts (e.g., 'Topic 1 - Part 1', 'Topic 1 - Part 2') and upload separately.",
        });
      }
    } else if (req.files && Object.keys(req.files).length > 0) {
      const files = [req.files?.file0?.[0], req.files?.file1?.[0], req.files?.file2?.[0]].filter(Boolean);
      if (files.length > 0) { // Only update if new files are provided
        const uploadResults = await Promise.all(files.map((file) => uploadToCloudinary(file, "videos")));
        for (const result of uploadResults) {
          if (result.duration > maxDuration) {
            await Promise.all(uploadResults.map((r) => deleteFromCloudinary(r.public_id, "video")));
            return res.status(400).json({
              success: false,
              message: "One or more videos exceed 10 minutes. Please reduce each part to 10 minutes or less.",
            });
          }
        }
        if (video.source === "upload" && video.publicIds.length > 0) {
          await Promise.all(video.publicIds.map((id) => deleteFromCloudinary(id, "video")));
        }
        content = uploadResults.map((r) => r.url).join(",");
        publicIds = uploadResults.map((r) => r.public_id);
        source = "upload";
        duration = uploadResults.reduce((sum, r) => sum + r.duration, 0); // Sum durations
      }
    }

    video.title = title || video.title;
    video.content = content;
    video.publicIds = publicIds;
    video.source = source;
    video.duration = duration;
    video.description = description || video.description;
    video.tags = tags ? tags.split(",").map((tag) => tag.trim()) : video.tags;
    video.status = status || video.status;
    video.updatedAt = Date.now();

    await video.save();
    const updatedVideo = await Video.findById(video._id).populate("author", "name role");
    return res.status(200).json({ success: true, message: "Video updated successfully", data: updatedVideo });
  } catch (error) {
    console.error("Error in updateVideo:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    if (video.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own videos" });
    }

    if (video.source === "upload") {
      if (video.publicIds && video.publicIds.length > 0) {
        await Promise.all(video.publicIds.map((publicId) => deleteFromCloudinary(publicId, "video")));
      } else {
        const urls = video.content.split(",");
        const publicIds = urls.map((url) => {
          const urlParts = url.split("/");
          return urlParts.slice(urlParts.indexOf("place-pro")).join("/").replace(/\.[^/.]+$/, "");
        });
        await Promise.all(publicIds.map((publicId) => deleteFromCloudinary(publicId, "video")));
      }
    }

    await Video.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVideo:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};