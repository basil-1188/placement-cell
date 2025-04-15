import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaSun, FaArrowLeft, FaSearch } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";

const InterviewParticipants = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/interview-participants/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setParticipants(response.data.data);
          setFilteredParticipants(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch participants");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching participants");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [backendUrl, userData, id]);

  useEffect(() => {
    const filtered = participants.filter((participant) =>
      participant.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredParticipants(filtered);
  }, [searchQuery, participants]);

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
              <FaUsers className="mr-3 text-teal-400" /> Interview Participants
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
            View students who participated in this AI interview
          </p>
        </motion.div>

        <motion.div
          className={`bg-${darkMode ? "gray-800" : "white"} rounded-xl shadow-lg p-8 mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate("/admin/ai-interviews/interviews")}
            className={`flex items-center px-4 py-2 mb-6 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="mr-2" /> Back to Interviews
          </motion.button>

          <div className="mb-6">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 pl-10 rounded ${darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border focus:outline-none focus:ring-2 focus:ring-teal-400`}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading participants...</p>
          ) : filteredParticipants.length === 0 ? (
            <p className="text-center text-gray-500">No participants found.</p>
          ) : (
            <div className="space-y-6">
              {filteredParticipants.map((participant) => (
                <motion.div
                  key={participant.studentId}
                  className={`border p-6 rounded-xl ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/admin/student-responses/${id}/${participant.studentId}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-teal-400">
                        {participant.studentName}
                      </h2>
                      <p className="text-gray-400">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded ${
                            participant.status === "completed"
                              ? "bg-green-500"
                              : participant.status === "in-progress"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } text-white`}
                        >
                          {participant.status}
                        </span>
                      </p>
                      <p className="text-gray-400">
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(participant.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-teal-400">
                      <FaUsers size={24} />
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

export default InterviewParticipants;