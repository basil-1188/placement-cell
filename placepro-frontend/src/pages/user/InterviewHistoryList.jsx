import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCalendarAlt, FaQuestion } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const InterviewHistoryList = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied. Student role required.");
      navigate("/login");
      return;
    }

    const fetchInterviews = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/user/ai-interviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          const processedInterviews = response.data.data
            .map((interview) => ({
              id: interview.id?.toString() || "",
              completedAt: interview.completedAt || "",
              questionCount: Number(interview.questionCount) || 0,
            }))
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

          setInterviews(processedInterviews);
        } else {
          throw new Error(response.data.message || "Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setError(error.response?.data?.message || error.message || "Failed to fetch interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [backendUrl, userData, navigate]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid date"
        : date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-indigo-50 to-gray-100">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
          Your Interview Journey
        </h1>
        {interviews.length === 0 ? (
          <div className="text-center py-16 bg-white bg-opacity-80 rounded-2xl shadow-lg">
            <p className="text-gray-600 text-xl mb-2">No interviews yet!</p>
            <p className="text-gray-500">Start an AI interview to see your history here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="group bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/user/interviews/${interview.id}`)}
              >
                <div className="flex items-center mb-4">
                  <FaCalendarAlt className="text-yellow-300 text-xl mr-2" />
                  <p className="text-lg font-semibold">
                    {formatDateTime(interview.completedAt)}
                  </p>
                </div>
                <div className="flex items-center">
                  <FaQuestion className="text-yellow-300 text-xl mr-2" />
                  <p className="text-lg font-semibold">
                    {interview.questionCount} Questions
                  </p>
                </div>
                <div className="mt-4 text-right">
                  <span className="inline-block text-sm bg-yellow-300 text-blue-900 px-3 py-1 rounded-full group-hover:bg-yellow-400 transition-colors">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistoryList;