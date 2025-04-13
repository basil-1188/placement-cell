import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaStar, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

const AIInterviewFeedback = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const interviewId = location.state?.interviewId;

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied—students only");
      navigate("/");
      return;
    }

    if (!interviewId) {
      toast.error("No interview ID provided");
      navigate("/user/ai-interview/take-test");
      return;
    }
  }, [userData, interviewId, navigate]);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please provide your feedback comment");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: "interview",
        entityId: interviewId,
        typeModel: "Interview", // Added to match schema
        comment,
        rating: rating || null,
      };

      const res = await axios.post(
        `${backendUrl}/api/user/submit-feedback`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Feedback submitted successfully!");
        navigate("/user/ai-interview/take-test");
      } else {
        toast.error(res.data.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast.error(err.response?.data?.message || "Error submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (userData?.role !== "student") return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 pt-10">
      <motion.div
        className="max-w-4xl mx-auto rounded-xl shadow-lg p-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white mt-[60px]"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
          <FaRobot className="mr-4 text-teal-200 text-5xl" /> Interview Feedback
        </h1>
        <p className="mt-3 text-lg text-center text-teal-100 opacity-90">
          Tell us about your interview experience
        </p>
      </motion.div>

      <motion.div
        className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-semibold text-teal-700 mb-2">
              How was the interview?
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about the interview..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="5"
              disabled={submitting}
            />
          </div>

          <div className="text-center">
            <label className="block text-xl font-semibold text-teal-700 mb-2">
              Rate your experience (optional)
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-3xl cursor-pointer ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300 flex items-center justify-center disabled:opacity-50"
            whileHover={{ scale: submitting ? 1 : 1.05 }}
            whileTap={{ scale: submitting ? 1 : 0.95 }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </motion.button>
        </form>

        <motion.button
          onClick={() => navigate("/user/ai-interview/take-test")}
          className="w-full mt-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft className="mr-2" /> Skip Feedback
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AIInterviewFeedback;