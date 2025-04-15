import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FaMoon, FaSun, FaArrowLeft } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminFeedback = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/feedback`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setFeedback(response.data.feedback);
          setFilteredFeedback(response.data.feedback);
        } else {
          toast.error(response.data.message || "Failed to fetch feedback");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error(error.response?.data?.message || "Error fetching feedback");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [backendUrl, userData, navigate]);

  useEffect(() => {
    let filtered = feedback;
    if (searchTerm) {
      filtered = filtered.filter((fb) =>
        fb.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((fb) => fb.type === typeFilter);
    }
    setFilteredFeedback(filtered);
  }, [searchTerm, typeFilter, feedback]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`text-xl animate-pulse ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <motion.div
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-16" : "md:ml-64"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className={`shadow-lg rounded-xl p-6 flex justify-between items-center border-t-4 border-indigo-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h1 className="text-3xl font-bold">Feedback Overview</h1>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/admin")}
                className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </motion.button>
            </div>
          </div>

          <div className={`shadow-lg rounded-xl p-6 border-t-4 border-blue-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="relative w-full md:w-1/3">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by comment..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                />
              </div>
              <div className="relative w-full md:w-1/4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`w-full pl-3 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  <option value="all">All Types</option>
                  <option value="mocktest">Mock Test</option>
                  <option value="job">Job</option>
                  <option value="studymaterial">Study Material</option>
                  <option value="general">General</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className={`shadow-lg rounded-xl border-t-4 border-indigo-500 overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Feedback List</h2>
              {filteredFeedback.length === 0 ? (
                <p className={`text-center py-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No feedback found for the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`text-sm uppercase tracking-wide ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <tr>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Comment</th>
                        <th className="p-4 font-medium">Rating</th>
                        <th className="p-4 font-medium">Submitted By</th>
                        <th className="p-4 font-medium">Submitted At</th>
                        <th className="p-4 font-medium">Target Role</th>
                        <th className="p-4 font-medium">Target User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedback.map((fb) => (
                        <motion.tr
                          key={fb._id}
                          className={`border-b hover:bg-gray-700 transition-colors ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className={`p-4 font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                            {fb.type.charAt(0).toUpperCase() + fb.type.slice(1)}
                          </td>
                          <td className="p-4">{fb.comment}</td>
                          <td className="p-4">{fb.rating}</td>
                          <td className="p-4">{fb.submittedBy} ({fb.submittedByEmail})</td>
                          <td className="p-4">{new Date(fb.submittedAt).toLocaleString()}</td>
                          <td className="p-4">{fb.targetRole}</td>
                          <td className="p-4">{fb.targetUser} ({fb.targetUserEmail})</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminFeedback;
