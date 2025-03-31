import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx"; // Adjust path

const BlogDetail = () => {
  const { backendUrl } = useContext(AppContext);
  const { blogId } = useParams(); // Get blogId from URL
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/blogs/${blogId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setBlog(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch blog");
          navigate("/user/blogs");
        }
      } catch (error) {
        console.error("Error fetching blog:", error.response ? error.response.data : error.message);
        toast.error(error.response?.data?.message || "Error fetching blog");
        navigate("/user/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [backendUrl, blogId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-xl">Blog not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mt-6">{blog.title}</h1>
        <div className="text-gray-500 text-sm mt-4 space-y-2">
          <p>
            <span className="font-medium text-gray-700">Author:</span> {blog.author?.name || "Placement Officer"}
          </p>
          <p>
            <span className="font-medium text-gray-700">Updated:</span>{" "}
            {new Date(blog.updatedAt).toLocaleDateString()}
          </p>
          {blog.tags.length > 0 && (
            <p>
              <span className="font-medium text-gray-700">Tags:</span>{" "}
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs mr-2"
                >
                  {tag}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
        <button
          onClick={() => navigate("/user/blogs")}
          className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Back to Blogs
        </button>
      </div>
    </div>
  );
};

export default BlogDetail;