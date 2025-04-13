import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaComments, FaSun } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";

const InterviewFeedback = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/interview-feedback`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setFeedbacks(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch feedback");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [backendUrl, userData]);

  if (userData?.role !== "admin") return null;

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <main className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-16" : "md:ml-64"}`}>
        <motion.div
          className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center">
              <FaComments className="mr-3 text-teal-400" /> User Feedback
            </h1>
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-white text-gray-600 hover:bg-gray-200"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? <FaSun size={20} /> : <FaSun size={20} />}
            </motion.button>
          </div>
          <p className={`mt-2 text-sm md:text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            Review feedback from assessments and queries
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <p className="text-center text-gray-400">Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-gray-500">No feedback available.</p>
          ) : (
            <ul className="space-y-6">
              {feedbacks.map((feedback, index) => (
                <li key={index} className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{feedback.submittedBy}</h3>
                    <span className="text-sm text-gray-400">
                      {new Date(feedback.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-300">Type: {feedback.type}</p>
                  <p className="mt-1 text-gray-300">Target: {feedback.targetUser || feedback.targetRole}</p>
                  <p className="mt-1">{feedback.comment}</p>
                  {feedback.rating && (
                    <p className="mt-1 text-sm">
                      Rating: <span className="text-yellow-400">{feedback.rating}/5</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default InterviewFeedback;