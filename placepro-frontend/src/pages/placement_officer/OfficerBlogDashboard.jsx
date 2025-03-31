import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";
import { FaPlus, FaEdit, FaTrash, FaEye, FaPaperPlane } from "react-icons/fa";
import BlogModal from "./BlogModal";

const OfficerBlogDashboard = () => {
  const { backendUrl } = useContext(AppContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/blogs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setBlogs(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch blogs");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [backendUrl]);

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/officer/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setBlogs(blogs.filter((blog) => blog._id !== blogId));
        toast.success("Blog deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting blog");
    }
  };

  const handlePublish = async (blogId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/officer/blogs/${blogId}`,
        { status: "published" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setBlogs(blogs.map((blog) => (blog._id === blogId ? { ...blog, status: "published" } : blog)));
        toast.success("Blog published successfully");
      } else {
        toast.error(response.data.message || "Failed to publish blog");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error publishing blog");
    }
  };

  const openModal = (blog = null) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-14 bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Placement Officer Blog Dashboard</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> New Blog Post
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No blogs created yet. Start by adding a new post!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 truncate">{blog.title}</h2>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </div>
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{blog.content}</p>
                <div className="text-gray-500 text-xs mb-4">
                  <p>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</p>
                  {blog.tags.length > 0 && (
                    <p className="mt-1">
                      Tags:{" "}
                      {blog.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs mr-1">
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => openModal(blog)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </button>
                  {blog.status === "draft" && (
                    <button
                      onClick={() => handlePublish(blog._id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Publish"
                    >
                      <FaPaperPlane size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <BlogModal
            blog={selectedBlog}
            onClose={() => setShowModal(false)}
            onSave={(updatedBlogs) => setBlogs(updatedBlogs)}
            backendUrl={backendUrl}
            apiBase="/api/officer"
          />
        )}
      </div>
    </div>
  );
};

export default OfficerBlogDashboard;