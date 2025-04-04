import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaBlog, FaSearch, FaFilter, FaPlus, FaEye, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const BlogsManagement = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/blogs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setBlogs(response.data.data);
          setFilteredBlogs(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch blogs");
          setTimeout(() => navigate("/admin"), 2000);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error.response?.status, error.response?.data);
        toast.error(error.response?.data?.message || "Error fetching blogs");
        setTimeout(() => navigate("/admin"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [userData, navigate, backendUrl]);

  useEffect(() => {
    let filtered = [...blogs];
    if (searchTerm) {
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((blog) => blog.status === statusFilter);
    }
    setFilteredBlogs(filtered);
  }, [searchTerm, statusFilter, blogs]);

  const handleViewBlog = (blogId) => {
    navigate(`/admin/blog/${blogId}`);
  };

  const handleAddBlog = () => {
    navigate("/admin/add-blog");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          className="text-xl font-bold text-gray-300"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-20" : "md:ml-64"}`}
      >
        <motion.div
          className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center">
              <FaBlog className="mr-3" /> Blogs & Tips
            </h1>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/admin")}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >Back To Dashboard
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-sm md:text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            Manage and review all blog posts for the platform
          </p>
        </motion.div>

        <div className={`rounded-xl shadow-md p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-700 bg-gray-50"}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full md:w-40 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-700 bg-gray-50"}`}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.length === 0 ? (
            <div className={`col-span-full rounded-xl shadow-md p-6 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <p className="text-lg font-medium text-gray-400">No blogs found matching your criteria.</p>
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                className={`rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ${darkMode ? "bg-gray-800" : "bg-white"}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gradient-to-r from-gray-700 to-gray-800">
                      <span className="text-gray-500 font-medium">No Image</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold line-clamp-2">{blog.title}</h2>
                  <p className="text-sm mt-1 text-gray-400">By {blog.author.name}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-2 line-clamp-3 text-gray-400">{blog.content}</p>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <motion.button
                    onClick={() => handleViewBlog(blog._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEye /> View
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogsManagement;