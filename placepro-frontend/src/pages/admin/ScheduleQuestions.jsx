import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaPlus, FaTrash, FaCalendarAlt, FaUserGraduate, FaSun } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ScheduleQuestions = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([""]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setStudents(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch students");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching students");
      }
    };
    fetchStudents();
  }, [backendUrl]);

  const handleAddQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/schedule-interview-questions`,
        { studentId: studentId || "all", questions: questions.filter((q) => q.trim()), scheduledAt },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Interview(s) scheduled successfully!");
        setStudentId("");
        setQuestions([""]);
        setScheduledAt("");
      } else {
        toast.error(response.data.message || "Failed to schedule interview");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error scheduling interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userData?.role !== "admin") {
    toast.error("Access denied. Admin role required.");
    return null;
  }

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
              <FaRobot className="mr-3 text-teal-400" /> Schedule AI Interview Questions
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
            Create and schedule AI-driven interviews for students
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8 max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaUserGraduate className="inline mr-2 text-teal-400" /> Select Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400`}
                required
              >
                <option value="">Select a student or all</option>
                <option value="all">All Students</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Questions</label>
              {questions.map((question, index) => (
                <div key={index} className="flex items-center mb-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    className={`flex-1 p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400`}
                    placeholder={`Question ${index + 1}`}
                    required
                  />
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="ml-2 p-2 text-red-400 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center text-teal-400 hover:text-teal-500 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Question
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <FaCalendarAlt className="inline mr-2 text-teal-400" /> Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400`}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className={`px-4 py-2 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"} rounded-lg hover:${darkMode ? "bg-gray-600" : "bg-gray-300"} transition-colors`}
                onClick={() => {
                  setStudentId("");
                  setQuestions([""]);
                  setScheduledAt("");
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ScheduleQuestions;