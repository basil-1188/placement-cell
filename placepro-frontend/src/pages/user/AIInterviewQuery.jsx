import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaQuestion } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AIInterviewQuery = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied. Student role required.");
      return;
    }
  }, [userData]);

  const handleSubmitQuery = async () => {
    if (!query.trim()) {
      toast.error("Query cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/ai-interview-query`, 
        { comment: query },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Query sent to admin!");
        setQuery("");
      } else {
        toast.error(response.data.message || "Failed to send query");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending query");
    } finally {
      setLoading(false);
    }
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
          <FaQuestion className="mr-4 text-teal-200 text-5xl" /> Send a Query
        </h1>
        <p className="mt-3 text-lg text-center text-teal-100 opacity-90">
          Reach out to the admin with your questions or concerns
        </p>
      </motion.div>

      <motion.div
        className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-100 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
          rows="6"
          placeholder="Type your query here..."
        />
        <motion.button
          onClick={handleSubmitQuery}
          disabled={loading}
          className="mt-6 w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-teal-300 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Sending..." : "Send Query"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AIInterviewQuery;