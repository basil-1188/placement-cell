import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaTools, FaArrowLeft, FaMoon, FaSun, FaTrash, FaDownload, FaSync } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminTools = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [secondConfirm, setSecondConfirm] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchTools = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/admin-tools`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        console.log("API Response:", response.data);
        if (response.data.success) {
          setTools(response.data.data?.tools || []);
        } else {
          toast.error(response.data.message || "Failed to fetch admin tools");
          setTools([]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching admin tools");
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [userData, navigate, backendUrl]);

  const handleToolAction = (tool) => {
    if (confirmAction === tool) {
      setSecondConfirm(tool);
    } else if (secondConfirm === tool) {
      executeToolAction(tool);
      setConfirmAction(null);
      setSecondConfirm(null);
    } else {
      setConfirmAction(tool);
      toast.warn(`Are you sure you want to ${tool.toLowerCase()}? This action cannot be undone. Click again to proceed.`, {
        autoClose: 5000,
      });
    }
  };

  const executeToolAction = (tool) => {
    switch (tool) {
      case "Clear Logs":
        toast.success("Logs cleared successfully (simulated)!");
        break;
      case "Export User Data":
        toast.success("User data exported successfully (simulated)!");
        break;
      case "Reset Mock Tests":
        toast.success("Mock tests reset successfully (simulated)!");
        break;
      default:
        toast.info(`${tool} executed (simulated)!`);
    }
  };

  const cancelConfirmation = () => {
    setConfirmAction(null);
    setSecondConfirm(null);
    toast.info("Action canceled.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          className="text-gray-300 text-xl font-semibold"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} font-sans`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-20" : "md:ml-64"}`}>
        <motion.div
          className={`rounded-lg shadow-lg p-6 flex items-center justify-between ${darkMode ? "bg-gray-800" : "bg-white"}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <FaTools className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-2xl font-bold">Admin Tools</h1>
          </div>
          <div className="flex items-center space-x-4">
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
              className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="mr-2" /> Back
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className={`mt-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">System Utilities</h2>
            <p className="text-sm text-gray-400">Manage critical system operations</p>
          </div>
          {tools.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No tools available at this time.</p>
            </div>
          ) : (
            <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <motion.div
                  key={tool}
                  className={`p-4 rounded-lg shadow-md ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-2">
                    {tool === "Clear Logs" && <FaTrash className="text-red-500 mr-2" />}
                    {tool === "Export User Data" && <FaDownload className="text-green-500 mr-2" />}
                    {tool === "Reset Mock Tests" && <FaSync className="text-blue-500 mr-2" />}
                    <h3 className="font-medium">{tool}</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    {tool === "Clear Logs"
                      ? "Remove all system logs (irreversible)."
                      : tool === "Export User Data"
                      ? "Download a CSV of all user data."
                      : "Reset all mock test results (irreversible)."}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleToolAction(tool)}
                      className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                        confirmAction === tool && secondConfirm !== tool
                          ? "bg-orange-500 hover:bg-orange-600"
                          : secondConfirm === tool
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {confirmAction === tool && secondConfirm !== tool
                        ? "Confirm"
                        : secondConfirm === tool
                        ? "Execute"
                        : "Run"}
                    </motion.button>
                    {confirmAction === tool && (
                      <motion.button
                        onClick={cancelConfirmation}
                        className="py-2 px-4 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {confirmAction && secondConfirm === confirmAction && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <h3 className="text-lg font-bold mb-4">Final Confirmation</h3>
              <p className="mb-4">
                Are you absolutely sure you want to {confirmAction.toLowerCase()}? This action is irreversible and may cause significant data loss.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleToolAction(confirmAction)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Yes, Execute
                </button>
                <button
                  onClick={cancelConfirmation}
                  className="bg-gray-600 text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-500"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminTools;