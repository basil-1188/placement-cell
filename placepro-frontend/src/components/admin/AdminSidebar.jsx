import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaUsers, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaUser, FaChartLine, FaTools, FaFileAlt, FaVideo, FaBriefcase, FaRobot, FaBlog, FaBell, FaBuilding, FaList, FaChartBar, FaComments } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const AdminSidebar = ({ isMinimized, setIsMinimized }) => {
  const { logout } = useContext(AppContext);
  const [dropdownStates, setDropdownStates] = useState({
    "/admin/manage-users": false,
    "/admin/ai-interviews": false,
  });
  const navigate = useNavigate();

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
        { path: "/admin/manage-users/officer-team", label: "Officers & Team" },
        { path: "/admin/manage-users/update-roles", label: "Update Role" },
      ],
    },
    { path: "/admin/mock-tests", label: "Mock Tests", icon: FaFileAlt },
    { path: "/admin/training-resources", label: "Training Resources", icon: FaVideo },
    { path: "/admin/job-management", label: "Job Management", icon: FaBriefcase },
    {
      path: "/admin/ai-interviews",
      label: "AI Interviews",
      icon: FaRobot,
      dropdown: [
        { path: "/admin/ai-interviews/schedule", label: "Schedule Questions", icon: FaList },
        { path: "/admin/ai-interviews/results", label: "Results", icon: FaChartBar },
        { path: "/admin/ai-interviews/feedback", label: "Feedback", icon: FaComments },
      ],
    },
    { path: "/admin/blogs", label: "Blogs & Tips", icon: FaBlog },
    { path: "/admin/reports", label: "Reports", icon: FaChartLine },
    { path: "/admin/notifications", label: "Notifications", icon: FaBell },
    { path: "/admin/admin-tools", label: "Admin Tools", icon: FaTools },
  ];

  return (
    <motion.aside
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg z-50 transition-all duration-300 ${isMinimized ? "w-16" : "w-64"}`}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 flex items-center justify-between">
        {!isMinimized && (
          <Link to="/admin" className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight">Place-Pro Admin</span>
          </Link>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:text-gray-300 focus:outline-none"
        >
          {isMinimized ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>
      <ul className="space-y-2 px-2">
        {adminNavItems.map((item) => (
          <li key={item.path} className="relative">
            {item.dropdown ? (
              <div className="dropdown">
                <button
                  className={`flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors ${isMinimized ? "justify-center" : ""}`}
                  onClick={() => !isMinimized && toggleDropdown(item.path)}
                  title={isMinimized ? item.label : ""}
                >
                  <item.icon className="text-lg" />
                  {!isMinimized && <span className="ml-3">{item.label}</span>}
                </button>
                {!isMinimized && dropdownStates[item.path] && (
                  <ul className="ml-6 space-y-1 bg-gray-800 rounded-md p-2">
                    {item.dropdown.map((dropdownItem) => (
                      <li key={dropdownItem.path}>
                        <Link
                          to={dropdownItem.path}
                          className="block py-2 px-4 hover:bg-gray-700 rounded-md transition-colors text-sm flex items-center"
                          onClick={() => toggleDropdown(item.path)}
                        >
                          {dropdownItem.icon && <dropdownItem.icon className="mr-2" />}
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
                className={`flex items-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors ${isMinimized ? "justify-center" : ""}`}
                title={isMinimized ? item.label : ""}
              >
                <item.icon className="text-lg" />
                {!isMinimized && <span className="ml-3">{item.label}</span>}
              </Link>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-3 px-4 rounded-lg hover:bg-red-600 transition-colors ${isMinimized ? "justify-center" : ""}`}
            title={isMinimized ? "Logout" : ""}
          >
            <FaUser className="text-lg" />
            {!isMinimized && <span className="ml-3">Logout</span>}
          </button>
        </li>
      </ul>
    </motion.aside>
  );
};

export default AdminSidebar;