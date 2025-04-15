import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaFileAlt, FaSun, FaArrowLeft, FaSave } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";

const StudentResponses = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [performanceScore, setPerformanceScore] = useState("");
  const navigate = useNavigate();
  const { interviewId, studentId } = useParams();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchResponses = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/admin/student-responses/${interviewId}/${studentId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setStudentData(response.data.data);
          setFeedback(
            response.data.data.responses.map((resp) => ({
              questionIndex: resp.questionIndex,
              feedback: resp.feedback,
            }))
          );
          setPerformanceScore(response.data.data.performanceScore?.toString() || "");
        } else {
          toast.error(response.data.message || "Failed to fetch responses");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching responses");
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [backendUrl, userData, interviewId, studentId]);

  const handleFeedbackChange = (questionIndex, value) => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.questionIndex === questionIndex ? { ...item, feedback: value } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const score = Number(performanceScore);
      if (isNaN(score) || score < 0 || score > 100) {
        toast.error("Performance score must be between 0 and 100");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/admin/update-feedback`,
        {
          interviewId,
          responses: feedback,
          performanceScore: score,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Feedback and score updated successfully");
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        navigate(`/admin/interview-participants/${interviewId}`);
      } else {
        toast.error(response.data.message || "Failed to update feedback");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating feedback");
    } finally {
      setSaving(false);
    }
  };

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
              <FaFileAlt className="mr-3 text-teal-400" /> Student Responses
            </h1>
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-white text-gray-600 hover:bg-gray-200"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSun size={20} />
            </motion.button>
          </div>
          <p className={`mt-2 text-sm md:text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            Review and provide feedback for {studentData?.studentName || "student"}'s interview
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8 mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate(`/admin/interview-participants/${interviewId}`)}
            className={`flex items-center px-4 py-2 mb-6 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="mr-2" /> Back to Participants
          </motion.button>

          {loading ? (
            <p className="text-center text-gray-400">Loading responses...</p>
          ) : !studentData ? (
            <p className="text-center text-gray-500">No responses found.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-teal-400">
                  {studentData.studentName}
                </h2>
                <p className="text-gray-400">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded ${
                      studentData.status === "completed"
                        ? "bg-green-500"
                        : studentData.status === "in-progress"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    } text-white`}
                  >
                    {studentData.status}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(studentData.date).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Performance Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={performanceScore}
                  onChange={(e) => setPerformanceScore(e.target.value)}
                  className={`w-full md:w-1/4 p-2 rounded ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border focus:outline-none focus:ring-2 focus:ring-teal-400`}
                  disabled={saving}
                />
              </div>

              {studentData.responses.map((resp) => (
                <motion.div
                  key={resp.questionIndex}
                  className={`border p-6 rounded-xl ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-teal-400">
                    Question: {resp.question}
                  </h3>
                  <p className="text-gray-400 mt-2">
                    <span className="font-medium">Answer:</span> {resp.answer}
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={
                        feedback.find((f) => f.questionIndex === resp.questionIndex)?.feedback || ""
                      }
                      onChange={(e) => handleFeedbackChange(resp.questionIndex, e.target.value)}
                      className={`w-full p-2 rounded ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border focus:outline-none focus:ring-2 focus:ring-teal-400`}
                      rows="4"
                      disabled={saving}
                    />
                  </div>
                </motion.div>
              ))}

              <motion.button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center px-4 py-2 mt-6 rounded-full ${
                  saving
                    ? "bg-gray-600 cursor-not-allowed"
                    : darkMode
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white`}
                whileHover={!saving ? { scale: 1.05 } : {}}
                whileTap={!saving ? { scale: 0.95 } : {}}
              >
                <FaSave className="mr-2" /> {saving ? "Saving..." : "Save Feedback"}
              </motion.button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentResponses;