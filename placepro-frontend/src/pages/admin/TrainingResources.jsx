import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, PlayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const TrainingResources = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchResources = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/training-resources`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setResources(response.data.resources);
          setFilteredResources(response.data.resources);
        } else {
          toast.error(response.data.message || "Failed to fetch resources");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error(error.response?.data?.message || "Error fetching resources");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [backendUrl, userData, navigate]);

  useEffect(() => {
    let filtered = [...resources];
    if (searchTerm) {
      filtered = filtered.filter((resource) =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((resource) => resource.type === typeFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((resource) => resource.status === statusFilter);
    }
    setFilteredResources(filtered);
  }, [searchTerm, typeFilter, statusFilter, resources]);

  const getVideoParts = (content) => {
    return content.split(",").map((url) => url.trim());
  };

  const getYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getResourcePreview = (resource) => {
    if (resource.type === "video") {
      const videoParts = getVideoParts(resource.content);
      const firstUrl = videoParts[0];
      const youtubeId = getYouTubeVideoId(firstUrl);

      if (youtubeId) {
        return (
          <div className="relative">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={resource.title}
              className="w-full h-40 object-cover rounded-t-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/320x180?text=Thumbnail+Error";
              }}
            />
            {videoParts.length > 1 && (
              <div className="absolute bottom-2 left-2 flex gap-2">
                {videoParts.map((url, index) => (
                  <motion.button
                    key={index}
                    onClick={() => window.open(url, "_blank")}
                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Part {index + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {videoParts.map((url, index) => (
              <motion.div
                key={index}
                className={`flex-shrink-0 w-40 rounded-lg overflow-hidden shadow-md ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-teal-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="h-8 w-8 text-white opacity-80" />
                  </div>
                </div>
                <div className="p-2 text-center">
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Part {index + 1}</p>
                  <motion.button
                    onClick={() => window.open(url, "_blank")}
                    className="mt-1 w-full py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        );
      }
    } else if (resource.type === "study_material" && resource.thumbnail) {
      return (
        <img src={resource.thumbnail} alt={resource.title} className="w-full h-40 object-cover rounded-lg" />
      );
    } else {
      return (
        <div className="w-full h-40 bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center rounded-lg">
          <span className="text-white text-xl font-bold">
            {resource.type === "study_material" ? "PDF" : resource.type === "qa" ? "Q&A" : "Live"}
          </span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <motion.div
          className={`text-xl font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-20" : "md:ml-72"}`}>
        <motion.div
          className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-indigo-600 to-teal-500 text-white"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Training Resources</h1>
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
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-600 hover:bg-indigo-100"} py-2 px-6 rounded-lg font-semibold transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>Discover and manage your training content</p>
        </motion.div>

        <div className={`rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row gap-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-700 bg-gray-50"}`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`flex-1 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-700 bg-gray-50"}`}
          >
            <option value="all">All Types</option>
            <option value="study_material">Study Material</option>
            <option value="qa">Q&A</option>
            <option value="live_class">Live Class</option>
            <option value="video">Video</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`flex-1 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-700 bg-gray-50"}`}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.length === 0 ? (
            <div className={`col-span-full rounded-xl shadow-md p-6 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No resources found.</p>
            </div>
          ) : (
            filteredResources.map((resource) => (
              <motion.div
                key={resource._id}
                className={`rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ${darkMode ? "bg-gray-800" : "bg-white"}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  {getResourcePreview(resource)}
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      resource.status === "published" ? "bg-green-500 text-white" : "bg-yellow-500 text-gray-900"
                    }`}
                  >
                    {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className={`text-xl font-bold mb-2 truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{resource.title}</h2>
                  <div className={`text-sm space-y-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <p>
                      <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Type:</span>{" "}
                      {resource.type.replace("_", " ").charAt(0).toUpperCase() +
                        resource.type.replace("_", " ").slice(1)}
                    </p>
                    <p>
                      <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Author:</span>{" "}
                      {resource.author?.name || "N/A"}
                    </p>
                    <p>
                      <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Created:</span>{" "}
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                    {resource.duration && (
                      <p>
                        <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Duration:</span>{" "}
                        {(resource.duration / 60).toFixed(2)} min
                      </p>
                    )}
                    {resource.type === "live_class" && (
                      <p>
                        <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Link:</span>{" "}
                        <a
                          href={resource.thumbnail || resource.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline break-words"
                        >
                          {resource.thumbnail || resource.content}
                        </a>
                      </p>
                    )}
                    {resource.type === "qa" && (
                      <p className={`truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{resource.content}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {resource.type === "study_material" && (
                      <motion.button
                        onClick={() => window.open(resource.content, "_blank")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                        View
                      </motion.button>
                    )}
                    {resource.type === "video" && getYouTubeVideoId(getVideoParts(resource.content)[0]) && (
                      <motion.button
                        onClick={() => window.open(getVideoParts(resource.content)[0], "_blank")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PlayIcon className="h-5 w-5" />
                        Play
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingResources;