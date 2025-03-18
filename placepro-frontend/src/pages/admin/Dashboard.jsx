import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout } = useContext(AppContext);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div
        className={`sidebar bg-gray-800 text-white w-64 space-y-6 py-7 px-2 fixed h-full transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : ""
        }`}
      >
        <h2 className="text-2xl font-bold text-center">Place-Pro Admin</h2>
        <nav>
          <Link
            to="/admin"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/reports"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Reports
          </Link>
          <Link
            to="/admin/users"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Users
          </Link>
          <Link
            to="/admin/interviews"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Interviews
          </Link>
        </nav>
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, Admin</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span>A</span>
            </div>
          </div>
        </header>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-600">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">150</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-600">Placed Students</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">75</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-600">Pending Interviews</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">20</p>
          </div>
        </div>

        {/* User Management */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">John Doe</td>
                <td className="p-3">john@example.com</td>
                <td className="p-3">Student</td>
                <td className="p-3">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">
                    Delete
                  </button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Jane Smith</td>
                <td className="p-3">jane@placepro.com</td>
                <td className="p-3">Admin</td>
                <td className="p-3">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;