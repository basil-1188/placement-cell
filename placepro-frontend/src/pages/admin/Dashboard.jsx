// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaUsers, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Dashboard = () => {
  const { backendUrl, userData, logout } = useContext(AppContext);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({
    "/admin/manage-users": false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      toast.error("Please log in to access the dashboard");
      navigate("/login");
      return;
    }
    if (userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/admin/index`, {}, { withCredentials: true });
        if (response.data.success) {
          setAdminData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to load dashboard data");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching admin data");
        console.error("Error in fetchAdminData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [backendUrl, userData, navigate]);

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

  if (!userData || userData.role !== "admin") return null;

  const adminNavItems = [
    { path: "/admin", label: "Dashboard" },
    {
      path: "/admin/manage-users",
      label: "Manage Users",
      dropdown: [
        { path: "/admin/manage-users/students", label: "Students" },
        { path: "/admin/manage-users/officers", label: "Placement Officers" },
        { path: "/admin/manage-users/training-team", label: "Training Team" },
        { path: "/admin/manage-users/role-update", label: "Update Role" },
      ],
    },
    { path: "/admin/reports", label: "Reports" },
    { path: "/admin/ai-interviews", label: "AI Interviews" },
    { path: "/admin/admin-tools", label: "Admin Tools" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Admin Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <Link to="/admin" className="flex items-center space-x-3">
            <span className="text-xl font-semibold">Admin Panel</span>
          </Link>

          <ul className="hidden md:flex space-x-8 text-lg font-medium">
            {adminNavItems.map((item) => (
              <li key={item.path} className="relative">
                {item.dropdown ? (
                  <div className="dropdown">
                    <button
                      className="hover:text-purple-400 focus:outline-none"
                      onClick={() => toggleDropdown(item.path)}
                    >
                      {item.label}
                    </button>
                    {dropdownStates[item.path] && (
                      <ul className="absolute left-0 mt-2 w-48 bg-gray-700 shadow-md rounded-md">
                        {item.dropdown.map((dropdownItem) => (
                          <li key={dropdownItem.path}>
                            <Link
                              to={dropdownItem.path}
                              className="block px-4 py-2 hover:bg-gray-600"
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
                  <Link to={item.path} className="hover:text-purple-400">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:text-red-400"
              >
                <FaUser className="text-lg" />
                <span>Logout</span>
              </button>
            </li>
          </ul>

          <button
            className="md:hidden text-2xl"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-gray-800 transition-transform duration-300 transform ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
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
                      className="hover:text-purple-400 focus:outline-none"
                      onClick={() => toggleDropdown(item.path)}
                    >
                      {item.label}
                    </button>
                    {dropdownStates[item.path] && (
                      <ul className="mt-2 w-48 bg-gray-700 shadow-md rounded-md">
                        {item.dropdown.map((dropdownItem) => (
                          <li key={dropdownItem.path}>
                            <Link
                              to={dropdownItem.path}
                              className="block px-4 py-2 hover:bg-gray-600"
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
                    className="hover:text-purple-400"
                    onClick={() => setIsNavOpen(false)}
                  >
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
                className="hover:text-red-400"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-20 p-6">
        <motion.h1
          className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Admin Dashboard
        </motion.h1>
        {loading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : adminData ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, label: "Total Users", value: adminData.totalUsers, color: "blue-500" },
              { icon: FaUserGraduate, label: "Students", value: adminData.totalStudents, color: "green-500" },
              { icon: FaUserTie, label: "Placement Officers", value: adminData.totalOfficers, color: "purple-500" },
              {
                icon: FaChalkboardTeacher,
                label: "Training Team",
                value: adminData.totalTrainingTeam,
                color: "orange-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <item.icon className={`text-${item.color} text-3xl`} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">{item.label}</h2>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-red-600 text-center">Failed to load data</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;