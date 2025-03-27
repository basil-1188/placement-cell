import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaUserGraduate, FaUserTie, FaChalkboardTeacher } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/admin/AdminSidebar";

const Dashboard = () => {
  const { loading } = useContext(AppContext);
  const [isMinimized, setIsMinimized] = useState(false);

  const adminData = {
    totalUsers: 150,
    totalStudents: 100,
    totalOfficers: 10,
    totalTrainingTeam: 5,
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          isMinimized ? "ml-16" : "ml-64"
        }`}
      >
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FaUsers, label: "Total Users", value: adminData.totalUsers, color: "bg-blue-600" },
            { icon: FaUserGraduate, label: "Students", value: adminData.totalStudents, color: "bg-green-600" },
            { icon: FaUserTie, label: "Placement Officers", value: adminData.totalOfficers, color: "bg-purple-600" },
            {
              icon: FaChalkboardTeacher,
              label: "Training Team",
              value: adminData.totalTrainingTeam,
              color: "bg-orange-600",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`${item.color} p-3 rounded-full text-white`}>
                <item.icon size={24} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600">{item.label}</h2>
                <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 bg-white p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/manage-users"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/reports"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
            >
              View Reports
            </Link>
            <Link
              to="/admin/admin-tools"
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-center"
            >
              Admin Tools
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;