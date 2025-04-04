import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const OfficerTrainingTeam = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewMode, setViewMode] = useState("placement_officer");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchOfficers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/officer-training-team`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOfficers(response.data.officers);
        } else {
          toast.error(response.data.message || "Failed to fetch team details");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching team:", error);
        toast.error(error.response?.data?.message || "Error fetching team details");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, [backendUrl, userData, navigate]);

  const filteredOfficers = officers.filter((officer) => officer.role === viewMode);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`text-xl animate-pulse ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <motion.div
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${
          isMinimized ? "md:ml-16" : "md:ml-64"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className={`shadow-sm border-b p-6 flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h1 className="text-2xl font-semibold">
              {viewMode === "placement_officer" ? "Placement Officers" : "Training Team"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("placement_officer")}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "placement_officer"
                      ? "bg-indigo-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Show Placement Officers
                </button>
                <button
                  onClick={() => setViewMode("training_team")}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "training_team"
                      ? "bg-indigo-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Show Training Team
                </button>
              </div>
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/admin")}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>

          <div className="mt-6">
            {filteredOfficers.length === 0 ? (
              <p className={`text-center py-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No {viewMode === "placement_officer" ? "placement officers" : "training team members"} found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOfficers.map((officer) => (
                  <motion.div
                    key={officer._id}
                    className={`rounded-lg shadow-md border p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={officer.profileImage || "https://via.placeholder.com/80"}
                      alt={officer.name || "Member"}
                      className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-indigo-100 dark:border-indigo-900"
                    />
                    <h3 className="text-lg font-semibold">{officer.name || "N/A"}</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>{officer.email || "N/A"}</p>
                    <button
                      onClick={() => {
                        const details = `Name: ${officer.name}\nEmail: ${officer.email}`;
                        navigator.clipboard.writeText(details);
                        toast.success("Details copied to clipboard!");
                      }}
                      className={`mt-4 font-medium text-sm ${
                        darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      Copy Details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OfficerTrainingTeam;