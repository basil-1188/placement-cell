import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaMoon, FaSun, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { loading, userData, backendUrl } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [adminData, setAdminData] = useState({ totalUsers: 0, totalStudents: 0, totalOfficers: 0, totalTrainingTeam: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/dashboard-stats`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/admin/notifications`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            withCredentials: true,
          }),
        ]);

        if (statsResponse.data.success) setAdminData(statsResponse.data.data);
        else toast.error(statsResponse.data.message || "Failed to fetch dashboard stats");

        if (activityResponse.data.success) setRecentActivity(activityResponse.data.data.slice(0, 5));
        else toast.error(activityResponse.data.message || "Failed to fetch recent activity");
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(error.response?.data?.message || "Error fetching dashboard data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl, userData]);

  const chartData = {
    labels: ["Students", "Officers", "Training Team"],
    datasets: [{
      label: "User Distribution",
      data: [adminData.totalStudents, adminData.totalOfficers, adminData.totalTrainingTeam],
      borderColor: "rgba(59, 130, 246, 1)",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: darkMode ? "#ffffff" : "#000000" } },
      title: { display: true, text: "User Role Trends", color: darkMode ? "#ffffff" : "#000000", font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: darkMode ? "#ffffff" : "#000000" }, grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" } },
      x: { ticks: { color: darkMode ? "#ffffff" : "#000000" }, grid: { display: false } },
    },
  };

  if (loading || dataLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <main className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-16" : "md:ml-64"}`}>
        <motion.div
          className={`flex justify-between items-center mb-8 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-white to-gray-50"} p-6 rounded-xl shadow-lg`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userData?.name || "Admin"}</h1>
            <p className={`text-md ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Overview as of {new Date().toLocaleDateString()} | Total Users: {adminData.totalUsers}
            </p>
          </div>
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full ${darkMode ? "bg-gray-600 text-yellow-400 hover:bg-gray-500" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FaUsers, label: "Total Users", value: adminData.totalUsers-1, color: "from-blue-600 to-blue-400" },
            { icon: FaUserGraduate, label: "Students", value: adminData.totalStudents, color: "from-green-600 to-green-400" },
            { icon: FaUserTie, label: "Officers", value: adminData.totalOfficers, color: "from-purple-600 to-purple-400" },
            { icon: FaChalkboardTeacher, label: "Training Team", value: adminData.totalTrainingTeam, color: "from-orange-600 to-orange-400" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center space-x-4 border-t-4 border-${item.color.split(" ")[0]}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`bg-gradient-to-br ${item.color} p-4 rounded-full text-white`}>
                <item.icon size={32} />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.label}</h2>
                <p className="text-4xl font-bold">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className={`lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FaChartLine className="mr-2" /> User Role Trends
              </h2>
            </div>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul className={`space-y-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {recentActivity.length ? recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className={`w-2 h-2 mt-2 rounded-full ${activity.message.includes("user") ? "bg-blue-500" : activity.message.includes("test") ? "bg-green-500" : "bg-purple-500"}`}></span>
                  <div>
                    <p>{activity.message}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                  </div>
                </li>
              )) : (
                <p className="text-gray-500">No recent activity available.</p>
              )}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className={`mt-6 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/manage-users/all-studentdetails" className={`${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white py-3 px-6 rounded-md transition-colors text-center font-semibold shadow-sm`}>Student Lists</Link>
            <Link to="/admin/reports" className={`${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white py-3 px-6 rounded-md transition-colors text-center font-semibold shadow-sm`}>View Reports</Link>
            <Link to="/admin/admin-tools" className={`${darkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"} text-white py-3 px-6 rounded-md transition-colors text-center font-semibold shadow-sm`}>Admin Tools</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;