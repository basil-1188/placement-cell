import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaChartBar, FaSun, FaSave } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";

const InterviewResults = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedFeedback, setEditedFeedback] = useState({});
  const [editedScores, setEditedScores] = useState({});

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/interview-results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setResults(response.data.data);
          const initialFeedback = {};
          const initialScores = {};
          response.data.data.forEach((result) => {
            initialFeedback[result.id] = result.responses.map((r) => r.feedback);
            initialScores[result.id] = result.score;
          });
          setEditedFeedback(initialFeedback);
          setEditedScores(initialScores);
        } else {
          toast.error(response.data.message || "Failed to fetch results");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [backendUrl, userData]);

  const handleFeedbackChange = (interviewId, questionIndex, value) => {
    setEditedFeedback((prev) => ({
      ...prev,
      [interviewId]: {
        ...(prev[interviewId] || []),
        [questionIndex]: value,
      },
    }));
  };

  const handleScoreChange = (interviewId, value) => {
    const score = Math.max(0, Math.min(100, Number(value))); 
    setEditedScores((prev) => ({
      ...prev,
      [interviewId]: score,
    }));
  };

  const saveFeedbackAndScore = async (interviewId) => {
    try {
      const interview = results.find((r) => r.id === interviewId);
      const payload = {
        interviewId,
        responses: interview.responses.map((r, idx) => ({
          questionIndex: r.questionIndex,
          feedback: editedFeedback[interviewId]?.[idx] || r.feedback,
        })),
        performanceScore: editedScores[interviewId] ?? interview.score,
      };

      const response = await axios.patch(
        `${backendUrl}/api/admin/interview-feedback`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Feedback and score saved!");
        setResults((prev) =>
          prev.map((r) =>
            r.id === interviewId
              ? {
                  ...r,
                  responses: r.responses.map((resp, idx) => ({
                    ...resp,
                    feedback: payload.responses[idx].feedback,
                  })),
                  score: payload.performanceScore,
                }
              : r
          )
        );
      } else {
        toast.error(response.data.message || "Failed to save");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving feedback");
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
              <FaChartBar className="mr-3 text-teal-400" /> Interview Results
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
            View and manage AI interview results
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <p className="text-center text-gray-400">Loading results...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500">No results available.</p>
          ) : (
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-teal-400">
                      {result.studentName} - {result.title}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editedScores[result.id] ?? result.score ?? ""}
                        onChange={(e) => handleScoreChange(result.id, e.target.value)}
                        className={`w-20 p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"}`}
                        placeholder="Score (0-100)"
                      />
                      <motion.button
                        onClick={() => saveFeedbackAndScore(result.id)}
                        className={`p-2 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSave />
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-gray-400">
                    <span className="font-medium">Date:</span> {new Date(result.date).toLocaleString()}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded ${
                        result.status === "completed"
                          ? "bg-green-500"
                          : result.status === "in-progress"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {result.status}
                    </span>
                  </p>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-300">Responses:</h3>
                    <ul className="space-y-4 mt-2">
                      {result.responses.map((resp, idx) => (
                        <li key={idx} className="border p-4 rounded">
                          <p className="font-medium">{resp.question}</p>
                          <p className="mt-1">
                            <span className="text-gray-400">Answer:</span> "{resp.answer}"
                          </p>
                          <textarea
                            value={editedFeedback[result.id]?.[idx] || resp.feedback}
                            onChange={(e) => handleFeedbackChange(result.id, idx, e.target.value)}
                            className={`w-full mt-2 p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"}`}
                            placeholder="Add or edit feedback"
                            rows={3}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default InterviewResults;