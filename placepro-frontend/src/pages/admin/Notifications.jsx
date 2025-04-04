import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaBell, FaArrowLeft, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const Notifications = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [filterTime, setFilterTime] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const notificationsWithStatus = response.data.data.map((n) => ({
            ...n,
            isRead: false,
          }));
          setNotifications(notificationsWithStatus);
          setFilteredNotifications(notificationsWithStatus);
        } else {
          toast.error(response.data.message || "Failed to fetch notifications");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userData, navigate, backendUrl]);

  useEffect(() => {
    let filtered = [...notifications];
    if (filterType !== "All") {
      filtered = filtered.filter((n) =>
        filterType === "Users"
          ? n.message.includes("user registered")
          : filterType === "Tests"
          ? n.message.includes("Mock test")
          : n.message.includes("Job opening")
      );
    }
    if (filterTime !== "All") {
      const now = new Date();
      filtered = filtered.filter((n) => {
        const timeDiff = now - new Date(n.timestamp);
        return filterTime === "Last Hour"
          ? timeDiff <= 3600000
          : filterTime === "Today"
          ? timeDiff <= 86400000
          : timeDiff <= 604800000;
      });
    }
    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [filterType, filterTime, notifications]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
    setFilteredNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <motion.div
          className={`text-xl font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}
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
            <FaBell className={`text-2xl mr-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h1 className="text-2xl font-bold">Notifications</h1>
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
              className={`flex items-center ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"} py-2 px-4 rounded-lg transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="mr-2" /> Back
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className={`mt-6 p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium mr-2">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`p-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  <option value="All">All</option>
                  <option value="Users">Users</option>
                  <option value="Tests">Tests</option>
                  <option value="Jobs">Jobs</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Time:</label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className={`p-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  <option value="All">All Time</option>
                  <option value="Last Hour">Last Hour</option>
                  <option value="Today">Today</option>
                  <option value="Last Week">Last Week</option>
                </select>
              </div>
            </div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Showing {filteredNotifications.length} notification(s)
            </p>
          </div>
        </motion.div>

        <motion.div
          className={`mt-6 rounded-lg shadow-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className={`text-${darkMode ? "gray-400" : "gray-600"}`}>No notifications match your filters.</p>
            </div>
          ) : (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {paginatedNotifications.map((notification) => (
                <motion.li
                  key={notification.id}
                  className={`p-6 flex items-start ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center flex-1">
                    <span
                      className={`w-2 h-2 rounded-full mr-4 ${
                        notification.message.includes("user registered")
                          ? "bg-green-500"
                          : notification.message.includes("Mock test")
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <div>
                      <p className={`font-medium ${notification.isRead ? (darkMode ? "text-gray-400" : "text-gray-500") : ""}`}>
                        {notification.message}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => toggleReadStatus(notification.id)}
                    className={`ml-4 text-sm px-3 py-1 rounded-full ${notification.isRead ? (darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600") : (darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-600")}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {notification.isRead ? "Mark Unread" : "Mark Read"}
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className={`p-4 flex justify-between items-center border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"} rounded-lg`}
              >
                Previous
              </button>
              <p className="text-sm">
                Page {currentPage} of {totalPages}
              </p>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"} rounded-lg`}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;