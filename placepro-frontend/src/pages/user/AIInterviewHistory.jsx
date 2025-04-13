import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory, FaChevronDown, FaChevronUp, FaStar, FaRegStar, FaUserTie } from "react-icons/fa";
import { RiFeedbackFill } from "react-icons/ri";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AIInterviewHistory = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedInterview, setExpandedInterview] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied. Student role required.");
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/ai-interviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });

        if (response.data.success) {
          // Filter for completed interviews with valid IDs and responses
          const validInterviews = response.data.data.filter(
            interview => interview?.status === "completed" &&
                       interview?._id &&
                       interview?.responses?.length > 0
          );

          // Safely fetch feedback for each interview
          const interviewsWithFeedback = await Promise.all(
            validInterviews.map(async (interview) => {
              try {
                if (!interview._id) {
                  console.error("Invalid interview ID:", interview);
                  return null;
                }

                const feedbackResponse = await axios.get(
                  `${backendUrl}/api/user/ai-interview/${interview._id}/feedback`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    withCredentials: true,
                  }
                );

                return {
                  ...interview,
                  feedback: feedbackResponse.data.success ? feedbackResponse.data.data : {
                    overallScore: interview.performanceScore || null,
                    overallComment: "Feedback not available",
                    responses: interview.responses.map(res => ({
                      questionIndex: res.questionIndex,
                      feedback: res.feedback || "No feedback provided"
                    }))
                  },
                };
              } catch (error) {
                console.error(`Error fetching feedback for ${interview._id}:`, error);
                return {
                  ...interview,
                  feedback: {
                    overallScore: interview.performanceScore || null,
                    overallComment: "Feedback load failed",
                    responses: interview.responses.map(res => ({
                      questionIndex: res.questionIndex,
                      feedback: res.feedback || "Feedback unavailable"
                    }))
                  }
                };
              }
            })
          );

          // Filter out any null interviews
          setInterviews(interviewsWithFeedback.filter(Boolean));
        } else {
          toast.error(response.data.message || "Failed to fetch history");
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error(error.response?.data?.message || "Error fetching history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [backendUrl, userData]);

  const toggleExpand = (interviewId) => {
    setExpandedInterview(expandedInterview === interviewId ? null : interviewId);
  };

  const renderScoreStars = (score) => {
    if (score === null || score === undefined) return null;
    
    const stars = [];
    const filledStars = Math.round(score / 20);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= filledStars ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }

    return (
      <div className="flex items-center">
        <div className="flex mr-2">{stars}</div>
        <span className="font-medium text-gray-700">{score}/100</span>
      </div>
    );
  };

  if (userData?.role !== "student") return null;

  return (
    <div className="min-h-screen mt-12 bg-gray-50 text-gray-900 px-4 sm:px-6 lg:px-8 pt-12 pb-20 font-sans">
      {/* Header */}
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center justify-center">
          <FaHistory className="mr-3 text-blue-600 text-3xl sm:text-4xl" /> Interview History
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Review your past AI interviews and feedback from administrators
        </p>
      </motion.div>

      {/* Content */}
      <motion.div
        className="max-w-6xl mx-auto mt-12 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaHistory className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">No interviews found</h3>
            <p className="mt-2 text-gray-500">
              We couldn't find any completed interviews in our records.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          interviews.map((interview) => (
            <motion.div
              key={interview._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * interviews.indexOf(interview) }}
            >
              {/* Interview card content */}
              <div
                className="flex justify-between items-center p-6 cursor-pointer"
                onClick={() => toggleExpand(interview._id)}
              >
                {/* Header content */}
              </div>

              <AnimatePresence>
                {expandedInterview === interview._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Admin Feedback Section */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <FaUserTie className="text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-800">Admin Feedback</h4>
                        </div>
                        {interview.feedback ? (
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <RiFeedbackFill className="text-blue-500 mt-1 mr-2" />
                              <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                  {interview.feedback.overallComment}
                                </p>
                              </div>
                            </div>
                            {interview.performanceScore !== null && (
                              <div className="flex items-center">
                                <span className="font-medium text-sm text-blue-800 mr-2">Performance:</span>
                                {renderScoreStars(interview.performanceScore)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-blue-700">Feedback not available</p>
                        )}
                      </div>

                      {/* Questions & Answers Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Interview Details</h4>
                        {interview.questions?.length > 0 ? (
                          <div className="space-y-4">
                            {interview.questions.map((question, idx) => {
                              const response = interview.responses?.find(
                                (r) => r.questionIndex === idx
                              );
                              const feedback = interview.feedback?.responses?.find(
                                (f) => f.questionIndex === idx
                              ) || { feedback: interview.responses?.find(r => r.questionIndex === idx)?.feedback || "No feedback" };

                              return (
                                <div
                                  key={`${interview._id}-q-${idx}`}
                                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                      Q{idx + 1}
                                    </div>
                                    <div className="ml-4 flex-1">
                                      <h5 className="text-base font-medium text-gray-900">
                                        {question.text || "Question not available"}
                                      </h5>
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-700">
                                          <span className="font-medium">Your Answer:</span>{" "}
                                          {response?.answer || "No response recorded"}
                                        </p>
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-sm text-gray-700">
                                          <span className="font-medium">Admin Feedback:</span>{" "}
                                          {feedback.feedback}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">No questions available</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default AIInterviewHistory;