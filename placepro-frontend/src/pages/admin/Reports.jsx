import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaChartLine, FaUsers, FaFileAlt, FaBriefcase, FaUserPlus, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PieController, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, PieController, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState({
    userStats: [],
    mockTestParticipation: [],
    jobOpenings: [],
    newlyRegistered: []
  });
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setReports(response.data.data);
          console.log("Frontend Mock Test Participation:", response.data.data.mockTestParticipation);
        } else {
          toast.error(response.data.message || "Failed to fetch reports");
          navigate("/admin");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching reports");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userData, navigate, backendUrl]);

  const userChartData = {
    labels: reports.userStats.map(stat => stat.role),
    datasets: [{
      label: "Users",
      data: reports.userStats.map(stat => stat.count),
      backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#F44336"],
      borderColor: ["#388E3C", "#1976D2", "#F57C00", "#D32F2F"],
      borderWidth: 1,
    }]
  };

  const mockTestChartData = {
    labels: reports.mockTestParticipation.length > 0 ? reports.mockTestParticipation.map(test => test.testName) : ["No Tests Conducted"],
    datasets: [{
      label: "Participants",
      data: reports.mockTestParticipation.length > 0 ? reports.mockTestParticipation.map(test => test.participantCount) : [0],
      backgroundColor: [
        "rgba(0, 0, 0, 0.8)",
        "rgba(240, 240, 240, 0.8)",
        "rgba(54, 162, 235, 0.8)",
      ],
      borderColor: [
        "rgba(0, 0, 0, 1)",
        "rgba(240, 240, 240, 1)",
        "rgba(54, 162, 235, 1)",
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: darkMode ? "#ffffff" : "#000000" } },
      title: { display: true, text: "", color: darkMode ? "#ffffff" : "#000000" }
    },
    scales: {
      x: {
        title: { display: true, text: "Test Name", color: darkMode ? "#ffffff" : "#000000" },
        ticks: { color: darkMode ? "#ffffff" : "#000000" },
        grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }
      },
      y: {
        title: { display: true, text: "Number of Students", color: darkMode ? "#ffffff" : "#000000" },
        beginAtZero: true,
        ticks: { color: darkMode ? "#ffffff" : "#000000" },
        grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: darkMode ? "#ffffff" : "#000000" } },
      title: { display: true, text: "", color: darkMode ? "#ffffff" : "#000000" }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-100 to-gray-300"}`}>
        <motion.div
          className={`text-2xl font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-20" : "md:ml-64"}`}>
        <motion.div
          className={`rounded-2xl shadow-xl p-6 mb-8 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center">
              <FaChartLine className="mr-3" /> Insights Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/admin")}
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-700 hover:bg-indigo-100"} py-2 px-6 rounded-lg font-semibold transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>Explore key metrics and performance trends</p>
        </motion.div>

        <div className="space-y-10">
          <motion.div
            className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-green-500 to-teal-500 text-white"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold flex items-center">
              <FaUsers className="mr-2" /> User Registration
            </h2>
            <div className="mt-4" style={{ height: "200px" }}>
              <Pie data={userChartData} options={{ ...pieChartOptions, plugins: { ...pieChartOptions.plugins, title: { display: true, text: "User Distribution by Role" } } }} />
            </div>
          </motion.div>

          <motion.div
            className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold flex items-center">
              <FaFileAlt className="mr-2" /> Mock Test Participation
            </h2>
            <div className="mt-4" style={{ height: "200px" }}>
              <Bar data={mockTestChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: "Participants per Test" } } }} />
            </div>
          </motion.div>

          <motion.div
            className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-orange-500 to-red-500 text-white"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold flex items-center">
              <FaBriefcase className="mr-2" /> Job Openings
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className={`min-w-full rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <thead>
                  <tr className={`${darkMode ? "bg-gray-600" : "bg-gray-200"} text-gray-700 dark:text-gray-300`}>
                    <th className="py-2 px-4">Job Title</th>
                    <th className="py-2 px-4">Company</th>
                    <th className="py-2 px-4">Posted On</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.jobOpenings.map(job => (
                    <tr key={job._id} className={`border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                      <td className="py-2 px-4">{job.title}</td>
                      <td className="py-2 px-4">{job.company}</td>
                      <td className="py-2 px-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold flex items-center">
              <FaUserPlus className="mr-2" /> Newly Registered Users
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className={`min-w-full rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <thead>
                  <tr className={`${darkMode ? "bg-gray-600" : "bg-gray-200"} text-gray-700 dark:text-gray-300`}>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.newlyRegistered.map(user => (
                    <tr key={user._id} className={`border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;