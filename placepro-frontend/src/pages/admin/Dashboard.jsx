// src/pages/admin/Dashboard.jsx
import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaUsers, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaUser, FaChartLine, FaTools } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { userData, logout } = useContext(AppContext);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({
    "/admin/manage-users": false,
  });
  const navigate = useNavigate();

  const adminData = {
    totalUsers: 150,
    totalStudents: 100,
    totalOfficers: 10,
    totalTrainingTeam: 5,
  };

  if (!userData || userData.role !== "admin") {
    toast.error("Access denied. Admin role required.");
    navigate("/login");
    return null;
  }

  const toggleDropdown = (path) => {
    setDropdownStates((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: FaChartLine },
    {
      path: "/admin/manage-users",
      label: "Manage Users",
      icon: FaUsers,
      dropdown: [
        { path: "/admin/manage-users/all-studentdetails", label: "Students" },
        { path: "/admin/manage-users/officers", label: "Officers & Training Team" },
        { path: "/admin/manage-users/update-roles", label: "Update Role" },
      ],
    },
    { path: "/admin/reports", label: "Reports", icon: FaChartLine },
    { path: "/admin/ai-interviews", label: "AI Interviews", icon: FaUserTie },
    { path: "/admin/admin-tools", label: "Admin Tools", icon: FaTools },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <motion.aside
        className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-50 hidden md:block"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <Link to="/admin" className="flex items-center space-x-3">
            <span className="text-2xl font-bold">Admin Panel</span>
          </Link>
        </div>
        <ul className="space-y-4 px-4">
          {adminNavItems.map((item) => (
            <li key={item.path} className="relative">
              {item.dropdown ? (
                <div className="dropdown">
                  <button
                    className="flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => toggleDropdown(item.path)}
                  >
                    <item.icon className="mr-3 text-lg" />
                    {item.label}
                  </button>
                  {dropdownStates[item.path] && (
                    <ul className="ml-6 mt-2 space-y-2 bg-gray-800 rounded-md p-2">
                      {item.dropdown.map((dropdownItem) => (
                        <li key={dropdownItem.path}>
                          <Link
                            to={dropdownItem.path}
                            className="block py-2 px-4 hover:bg-gray-700 rounded-md transition-colors"
                            onClick={() => toggleDropdown(item.path)}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="mr-3 text-lg" />
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center w-full py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaUser className="mr-3 text-lg" />
              Logout
            </button>
          </li>
        </ul>
      </motion.aside>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-md z-50 md:hidden">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <Link to="/admin" className="flex items-center space-x-3">
            <span className="text-xl font-semibold">Admin Panel</span>
          </Link>
          <button
            className="text-2xl"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-gray-900 transition-transform duration-300 transform ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end p-6">
            <button onClick={() => setIsNavOpen(false)}>
              <FaTimes className="text-3xl" />
            </button>
          </div>
          <ul className="flex flex-col items-center space-y-6 text-xl font-medium">
            {adminNavItems.map((item) => (
              <li key={item.path} className="relative">
                {item.dropdown ? (
                  <div className="dropdown">
                    <button
                      className="flex items-center hover:text-purple-400 focus:outline-none"
                      onClick={() => toggleDropdown(item.path)}
                    >
                      <item.icon className="mr-2" />
                      {item.label}
                    </button>
                    {dropdownStates[item.path] && (
                      <ul className="mt-2 w-48 bg-gray-800 shadow-md rounded-md">
                        {item.dropdown.map((dropdownItem) => (
                          <li key={dropdownItem.path}>
                            <Link
                              to={dropdownItem.path}
                              className="block px-4 py-2 hover:bg-gray-700"
                              onClick={() => {
                                setIsNavOpen(false);
                                toggleDropdown(item.path);
                              }}
                            >
                              {dropdownItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center hover:text-purple-400"
                    onClick={() => setIsNavOpen(false)}
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setIsNavOpen(false);
                }}
                className="flex items-center hover:text-red-400"
              >
                <FaUser className="mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="flex-1 p-6 md:ml-64 pt-20">
        <motion.h1
          className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FaUsers, label: "Total Users", value: adminData.totalUsers, color: "blue-600" },
            { icon: FaUserGraduate, label: "Students", value: adminData.totalStudents, color: "green-600" },
            { icon: FaUserTie, label: "Placement Officers", value: adminData.totalOfficers, color: "purple-600" },
            {
              icon: FaChalkboardTeacher,
              label: "Training Team",
              value: adminData.totalTrainingTeam,
              color: "orange-600",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4 border-l-4 border-l-[color]"
              style={{ borderLeftColor: item.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <item.icon className={`text-${item.color} text-4xl`} />
              <div>
                <h2 className="text-md font-semibold text-gray-600">{item.label}</h2>
                <p className="text-3xl font-bold text-gray-800">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 bg-white p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/manage-users"
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/reports"
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              View Reports
            </Link>
            <Link
              to="/admin/admin-tools"
              className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
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