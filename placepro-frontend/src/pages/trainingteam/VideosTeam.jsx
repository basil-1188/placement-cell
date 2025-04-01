import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp, FaVideo, FaSpinner, FaSearch } from "react-icons/fa";

const VideosTeam = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoType, setVideoType] = useState("youtube");
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    description: "",
    tags: "",
    isSingleVideo: true,
    files: [null, null, null],
  });
  const [editingId, setEditingId] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    if (!userData || userData.role !== "training_team") {
      toast.error("Access denied: Training Team role required.");
      window.location.href = "/login";
      return;
    }
    fetchVideos();
  }, [backendUrl, userData]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/team/videos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setVideos(response.data.data);
        setFilteredVideos(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch videos");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching videos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = videos.filter((video) =>
      video.title.toLowerCase().includes(query) ||
      (video.description && video.description.toLowerCase().includes(query)) ||
      video.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      video.content.toLowerCase().includes(query)
    );
    setFilteredVideos(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (index) => (e) => {
    const newFiles = [...formData.files];
    newFiles[index] = e.target.files[0];
    setFormData((prev) => ({ ...prev, files: newFiles, youtubeUrl: "" }));
  };

  const handleYoutubeUrlChange = (e) => {
    setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value, files: [null, null, null] }));
  };

  const handleSingleVideoChange = (e) => {
    setFormData((prev) => ({ ...prev, isSingleVideo: e.target.value === "true" }));
  };

  const handleVideoTypeChange = (type) => {
    setVideoType(type);
    setFormData((prev) => ({
      ...prev,
      youtubeUrl: type === "youtube" ? prev.youtubeUrl : "",
      files: type === "recorded" ? prev.files : [null, null, null],
    }));
    if (type === "youtube") setExistingFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("tags", formData.tags);

    try {
      if (videoType === "youtube") {
        if (!formData.youtubeUrl && !editingId) {
          throw new Error("YouTube URL is required");
        }
        if (formData.youtubeUrl) data.append("youtubeUrl", formData.youtubeUrl);
      } else {
        const validFiles = formData.files.filter((file) => file !== null);
        if (validFiles.length === 0 && !editingId) {
          throw new Error("At least one video file is required for new uploads");
        }
        validFiles.forEach((file, index) => data.append(`file${index}`, file));
      }

      if (editingId) {
        const response = await axios.put(`${backendUrl}/api/team/videos/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        toast.success(response.data.message || "Video updated successfully!");
      } else {
        const response = await axios.post(`${backendUrl}/api/team/videos`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        toast.success(response.data.message || "Video uploaded successfully!");
      }
      resetForm();
      fetchVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Error submitting video");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (video) => {
    if (video.author._id.toString() !== userData._id.toString()) {
      toast.error("You can only edit your own videos.");
      return;
    }
    setEditingId(video._id);
    setVideoType(video.source === "youtube" ? "youtube" : "recorded");
    setFormData({
      title: video.title,
      youtubeUrl: video.source === "youtube" ? video.content : "",
      description: video.description || "",
      tags: video.tags.join(", "),
      isSingleVideo: video.source === "upload" && !video.content.includes(","),
      files: [null, null, null],
    });
    if (video.source === "upload") {
      setExistingFiles(video.content.split(","));
    } else {
      setExistingFiles([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(id);
    try {
      const response = await axios.delete(`${backendUrl}/api/team/videos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      toast.success(response.data.message || "Video deleted successfully!");
      fetchVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting video");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/team/videos/${id}`,
        { status: "published" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Video published successfully!");
      fetchVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error publishing video");
    }
  };

  const toggleExpand = (id) => {
    setExpandedVideo(expandedVideo === id ? null : id);
  };

  const resetForm = () => {
    setFormData({ title: "", youtubeUrl: "", description: "", tags: "", isSingleVideo: true, files: [null, null, null] });
    setVideoType("youtube");
    setEditingId(null);
    setIsModalOpen(false);
    setExistingFiles([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Manage Training Videos</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                Create, edit, and publish video resources for your students.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 max-w-3xl mx-auto">
                <div className="relative flex-grow">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search videos by title, description, or tags..."
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 placeholder-gray-500 transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                >
                <FaPlus className="mr-2" /> Add New Video
                </button>
            </div>
            </div>

        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg font-medium">
              {searchQuery ? "No matching videos found" : "No videos available yet. Start by adding one!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(video._id)}
                >
                  <h2 className="text-xl font-bold text-gray-800 truncate">{video.title}</h2>
                  {expandedVideo === video._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedVideo === video._id && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-2">{video.description || "No description"}</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-40 overflow-y-auto">
                      {video.source === "youtube" ? (
                        <div className="flex items-center gap-2">
                          <FaVideo className="text-blue-500" />
                          <a
                            href={video.content}
                            className="text-blue-600 hover:underline truncate"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {video.content}
                          </a>
                        </div>
                      ) : (
                        video.content.split(",").map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <FaVideo className="text-blue-500" />
                            <span className="text-gray-700 font-medium">Part {index + 1}:</span>
                            <a
                              href={url}
                              className="text-blue-600 hover:underline truncate flex-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {url}
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Source:</span> {video.source === "youtube" ? "YouTube" : "Uploaded"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Duration:</span>{" "}
                    {video.duration ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s` : "N/A"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        video.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {video.status}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Updated:</span>{" "}
                    {new Date(video.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {video.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1 disabled:text-red-400 disabled:cursor-not-allowed"
                      disabled={deletingId === video._id}
                    >
                      {deletingId === video._id ? (
                        <>
                          <FaSpinner className="animate-spin" /> Deleting...
                        </>
                      ) : (
                        <FaTrash size={18} />
                      )}
                    </button>
                  </div>
                  {video.status === "draft" && (
                    <button
                      onClick={() => handlePublish(video._id)}
                      className="flex items-center bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-all duration-200"
                    >
                      <FaPaperPlane className="mr-1" /> Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes size={24} />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text">
                {editingId ? "Edit Video" : "Add New Video"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Video Title"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
                  <div className="flex gap-4 bg-gray-100 p-2 rounded-lg">
                    <label className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="videoType"
                        value="youtube"
                        checked={videoType === "youtube"}
                        onChange={() => handleVideoTypeChange("youtube")}
                        className="mr-2 accent-blue-600"
                      />
                      <span className="text-gray-700 font-medium">YouTube</span>
                    </label>
                    <label className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="videoType"
                        value="recorded"
                        checked={videoType === "recorded"}
                        onChange={() => handleVideoTypeChange("recorded")}
                        className="mr-2 accent-blue-600"
                      />
                      <span className="text-gray-700 font-medium">Recorded</span>
                    </label>
                  </div>
                </div>
                {videoType === "youtube" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                      <input
                        type="text"
                        name="youtubeUrl"
                        value={formData.youtubeUrl}
                        onChange={handleYoutubeUrlChange}
                        placeholder="YouTube URL"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                        required={!editingId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Description"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="Tags (comma-separated)"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Does this topic fit in one video?
                      </label>
                      <select
                        value={formData.isSingleVideo}
                        onChange={handleSingleVideoChange}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 transition-all duration-200"
                      >
                        <option value={true}>Yes</option>
                        <option value={false}>No, multiple parts needed</option>
                      </select>
                    </div>
                    {formData.isSingleVideo ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                        {editingId && existingFiles[0] && (
                          <p className="text-gray-600 text-sm mb-2">
                            Current: {existingFiles[0].split("/").pop()}
                          </p>
                        )}
                        <input
                          type="file"
                          name="file0"
                          onChange={handleFileChange(0)}
                          accept="video/*"
                          className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-200"
                          required={!editingId}
                        />
                      </div>
                    ) : (
                      [0, 1, 2].map((index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Part {index + 1} {index === 0 && !editingId && "(required)"}
                          </label>
                          {editingId && existingFiles[index] && (
                            <p className="text-gray-600 text-sm mb-2">
                              Current: {existingFiles[index].split("/").pop()}
                            </p>
                          )}
                          <input
                            type="file"
                            name={`file${index}`}
                            onChange={handleFileChange(index)}
                            accept="video/*"
                            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-200"
                            required={index === 0 && !editingId}
                          />
                        </div>
                      ))
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Description"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="Tags (comma-separated)"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      editingId ? "Update" : "Save as Draft"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosTeam;