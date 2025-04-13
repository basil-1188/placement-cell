import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const AIInterviewTakeTest = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied. Student role required.");
      return;
    }

    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/ai-interviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const pendingInterviews = response.data.data.filter((i) => i.status !== "completed");
          console.log("Fetched interviews:", pendingInterviews); // Debug log
          setInterviews(pendingInterviews);
        } else {
          toast.error(response.data.message || "Failed to fetch interviews");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching interviews");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [backendUrl, userData]);

  const handleStartInterview = (id) => {
    setSelectedInterviewId(id);
    setShowInstructions(true);
  };

  const proceedToInterview = () => {
    setShowInstructions(false);
    navigate(`/user/ai-interview/take-test/${selectedInterviewId}`);
  };

  if (userData?.role !== "student") return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 pt-10">
      <motion.div
        className="max-w-4xl mx-auto rounded-xl shadow-lg p-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white mt-[60px]"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
          <FaRobot className="mr-4 text-teal-200 text-5xl" /> AI Interview Hub
        </h1>
        <p className="mt-3 text-lg text-center text-teal-100 opacity-90">
          Begin your scheduled AI-powered interviews below
        </p>
      </motion.div>

      <motion.div
        className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse">Loading your interviews...</p>
        ) : interviews.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No interviews scheduled at the moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {interviews.map((interview) => (
              <motion.div
                key={interview.id}
                className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * interviews.indexOf(interview) }}
              >
                <h3 className="text-xl font-semibold text-teal-700">
                  {new Date(interview.scheduledAt).toLocaleString()}
                </h3>
                <p className="mt-2 text-gray-600">
                  <span className="font-medium">Created by:</span> {interview.createdBy}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Questions:</span> {interview.questionCount}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`${
                      interview.status === "pending" ? "text-yellow-500" : "text-blue-500"
                    } font-semibold`}
                  >
                    {interview.status}
                  </span>
                </p>
                <motion.button
                  onClick={() => handleStartInterview(interview.id)}
                  className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Begin Interview
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Interview Instructions</h2>
            <p className="text-gray-700 mb-2">
              Welcome to your AI-powered interview! Here’s how it works:
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-4">
              <li>The AI will speak each question aloud.</li>
              <li>After 2 seconds, you’ll see "NOW ANSWER" and have <strong>90 seconds</strong> to respond.</li>
              <li>Speak clearly in a quiet environment for best results.</li>
              <li>Once you finish answering, click "Next Question" to proceed.</li>
              <li>For the last question, click "Finish Interview" to submit.</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Tip:</strong> Use a good microphone and avoid background noise for accurate speech capture.
            </p>
            <motion.button
              onClick={proceedToInterview}
              className="w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Interview
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIInterviewTakeTest;