import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaArrowLeft, FaBlog, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const BlogView = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/blogs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const selectedBlog = response.data.data.find((b) => b._id === blogId);
          if (selectedBlog) {
            setBlog(selectedBlog);
          } else {
            toast.error("Blog not found");
            navigate("/admin/blogs");
          }
        } else {
          toast.error(response.data.message || "Failed to fetch blog");
          navigate("/admin/blogs");
        }
      } catch (error) {
        console.error("Error fetching blog:", error.response?.status, error.response?.data);
        toast.error(error.response?.data?.message || "Error fetching blog");
        navigate("/admin/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [userData, blogId, navigate, backendUrl]);

  useEffect(() => {
    if (blog && quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        readOnly: true,
        modules: {
          toolbar: false,
        },
      });

      try {
        const delta = JSON.parse(blog.content);
        quillInstance.current.setContents(delta);
      } catch {
        quillInstance.current.setText(blog.content);
      }
    }
  }, [blog]);

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

  if (!blog) {
    return null;
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
              <FaBlog className="mr-3" /> {blog.title}
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
                onClick={() => navigate("/admin/blogs")}
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-600 hover:bg-indigo-100"} py-2 px-4 md:px-6 rounded-lg font-semibold transition-colors flex items-center gap-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft /> Back to Blogs
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-sm md:text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            By {blog.author.name} | {new Date(blog.createdAt).toLocaleDateString()}
          </p>
        </motion.div>

        <div className="rounded-xl shadow-md p-6 md:p-8 bg-gray-800">
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{blog.title}</h2>
            <div ref={quillRef} className="quill-view min-h-[200px]"></div>
          </div>
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm rounded-full bg-blue-900 text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 text-sm text-gray-400">
            <p>
              Status:{" "}
              <span
                className={`font-semibold ${blog.status === "published" ? "text-green-400" : "text-yellow-400"}`}
              >
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </span>
            </p>
            <p>Last Updated: {new Date(blog.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogView;