import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaChartBar, FaSun, FaFilter } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useNavigate } from "react-router-dom";

const AdminInterviews = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/interviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setInterviews(response.data.data);
          setFilteredInterviews(response.data.data);
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

  const handleFilter = () => {
    let filtered = interviews;

    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter((interview) => {
        const interviewDate = new Date(interview.date);
        return (
          interviewDate.getFullYear() === filterDateObj.getFullYear() &&
          interviewDate.getMonth() === filterDateObj.getMonth() &&
          interviewDate.getDate() === filterDateObj.getDate()
        );
      });
    }

    setFilteredInterviews(filtered);
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
              <FaChartBar className="mr-3 text-teal-400" /> Interview Overview
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
            View and manage AI interview sessions
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8 mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </motion.button>
            {showFilters && (
              <motion.div
                className={`mt-4 p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`w-full md:w-1/4 p-2 rounded ${darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"} border ${darkMode ? "border-gray-500" : "border-gray-300"}`}
                />
                <motion.button
                  onClick={handleFilter}
                  className={`mt-4 px-4 py-2 rounded-full ${darkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"} text-white`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply Filters
                </motion.button>
              </motion.div>
            )}
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading interviews...</p>
          ) : filteredInterviews.length === 0 ? (
            <p className="text-center text-gray-500">No interviews available.</p>
          ) : (
            <div className="space-y-6">
              {filteredInterviews.map((interview) => (
                <motion.div
                  key={interview.id}
                  className={`border p-6 rounded-xl ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/admin/interview-participants/${interview.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-teal-400">
                        {interview.title}
                      </h2>
                      <p className="text-gray-400">
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(interview.date).toLocaleString()}
                      </p>
                      <p className="text-gray-400">
                        <span className="font-medium">Progress:</span>{" "}
                        <span className="px-2 py-1 rounded bg-teal-500 text-white">
                          {interview.status}
                        </span>
                      </p>
                      <p className="text-gray-400">
                        <span className="font-medium">Total Participants:</span> {interview.studentCount}
                      </p>
                    </div>
                    <div className="text-teal-400">
                      <FaChartBar size={24} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminInterviews;