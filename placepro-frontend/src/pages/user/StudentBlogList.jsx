import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import { AppContext } from "../../context/AppContext.jsx"; 

const StudentBlogList = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate(); 
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log("Fetching blogs from:", `${backendUrl}/api/user/student-blogs`);
        console.log("Token:", localStorage.getItem("token"));
        const response = await axios.get(`${backendUrl}/api/user/student-blogs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        console.log("Response:", response.data);
        if (response.data.success) {
          setBlogs(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch blogs");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error.response ? error.response.data : error.message);
        toast.error(error.response?.data?.message || "Error fetching blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Placement Insights
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore tips, tricks, and updates from our placement officers to boost your career journey.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-lg mx-auto">
            <p className="text-gray-500 text-xl font-medium">
              No published blogs available yet.
            </p>
            <p className="text-gray-400 mt-2">
              Check back later for updates from your placement team!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.content}
                  </p>
                  <div className="text-gray-500 text-xs space-y-2">
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
                            className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs mr-2 mt-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-700">Author:</span>{" "}
                      {blog.author?.name || "Placement Officer"}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/user/blogs/${blog._id}`)} 
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBlogList;