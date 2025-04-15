import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaRegStar, FaQuestionCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const InterviewDetails = () => {
  const { id } = useParams();
  const { backendUrl, userData } = useContext(AppContext);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied. Student role required.");
      navigate("/user/interviews");
      return;
    }

    const fetchInterviewDetails = async () => {
      try {
        setError(null);
        console.log("Fetching details for ID:", id);
        const response = await axios.get(
          `${backendUrl}/api/user/ai-interview/${id}/feedback`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            withCredentials: true,
          }
        );

        console.log("Details API response:", response.data);

        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setInterview({
            completedAt: data.completedAt,
            performanceScore: data.performanceScore,
            responses: (data.responses || []).map((res) => ({
              question:
                data.questions && data.questions[res.questionIndex]?.text
                  ? data.questions[res.questionIndex].text
                  : "Question not available",
              answer: res.answer || "No answer provided",
              feedback: res.feedback || "No feedback provided",
            })),
          });
        } else {
          throw new Error(response.data.message || "Failed to load interview details");
        }
      } catch (error) {
        console.error("Error fetching interview details:", error.stack);
        setError(error.message || "Failed to load interview details");
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== "undefined" && id !== "") {
      fetchInterviewDetails();
    } else {
      setError("Invalid interview ID");
      setLoading(false);
    }
  }, [id, backendUrl, userData, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid date"
        : date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "Invalid date";
    }
  };

  const renderScoreStars = (score) => {
    if (score === null || score === undefined) {
      return <span className="text-gray-300 italic">Not evaluated</span>;
    }
    const clampedScore = Math.max(0, Math.min(100, score));
    const filledStars = Math.round(clampedScore / 20);
    const emoji = clampedScore >= 90 ? "🎉" : clampedScore >= 70 ? "😊" : clampedScore >= 50 ? "🙂" : "😔";
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= filledStars ? (
          <FaStar key={i} className="text-yellow-300 inline mr-1 text-xl" />
        ) : (
          <FaRegStar key={i} className="text-gray-500 inline mr-1 text-xl" />
        )
      );
    }
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 font-semibold text-white text-lg">{clampedScore}/100</span>
        <span className="ml-2 text-2xl">{emoji}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="container mx-auto px-4 py-12 text-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
        <p className="text-red-600 text-xl mb-6">{error || "Interview details not found"}</p>
        <button
          onClick={() => navigate("/user/interviews")}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Back to Interviews
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/user/interviews")}
          className="flex items-center text-blue-700 hover:text-blue-900 mb-8 text-lg font-semibold transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Interview History
        </button>

        <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl animate-fade-in">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 text-center">
            Your Interview Insights
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="flex items-center">
              <p className="text-gray-800 text-lg">
                <span className="font-bold">Completed:</span>{" "}
                {formatDate(interview.completedAt)}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Performance Score</h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-5 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                {renderScoreStars(interview.performanceScore)}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <FaQuestionCircle className="mr-3 text-blue-600 text-2xl" />
              Your Responses ({interview.responses.length})
            </h2>
            {interview.responses.length === 0 ? (
              <p className="text-gray-600 text-lg">No responses recorded</p>
            ) : (
              <div className="space-y-8">
                {interview.responses.map((response, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Question {index + 1}: {response.question}
                    </h3>
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-600 mb-2">Your Response</h4>
                      <p className="bg-white p-4 rounded-lg text-gray-700 shadow-sm">
                        {response.answer}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-600 mb-2">Feedback</h4>
                      <p className="bg-blue-100 p-4 rounded-lg text-blue-900 shadow-sm">
                        {response.feedback}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails;