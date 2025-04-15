import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MockTests = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchMockTests = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/mock-tests`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setTests(response.data.tests);
          setFilteredTests(response.data.tests);
        } else {
          toast.error(response.data.message || "Failed to fetch mock tests");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching mock tests:", error);
        toast.error(error.response?.data?.message || "Error fetching mock tests");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, [backendUrl, userData, navigate]);

  useEffect(() => {
    let filtered = tests;
    if (searchTerm) {
      filtered = filtered.filter((test) =>
        test.testName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((test) =>
        statusFilter === "published" ? test.isPublished : !test.isPublished
      );
    }
    if (startDateFilter) {
      filtered = filtered.filter((test) =>
        new Date(test.startDate).toISOString().split("T")[0] >= startDateFilter
      );
    }
    setFilteredTests(filtered);
  }, [searchTerm, statusFilter, startDateFilter, tests]);

  const handleGraphClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const test = filteredTests[index]; // Use filteredTests to match visible data
      setSelectedTest(test._id === selectedTest ? null : test._id);
    }
  };

  const performanceData = {
    labels: filteredTests.map((test) => test.testName), // Use filteredTests
    datasets: [
      {
        label: "Average Mark (% of Pass Mark)",
        data: filteredTests.map((test) =>
          test.passMark ? ((parseFloat(test.avgMark) / test.passMark) * 100).toFixed(2) : 0
        ),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 14, weight: "bold" }, color: darkMode ? "#ffffff" : "#000000" } },
      title: {
        display: true,
        text: "Student Performance Trend",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
        color: darkMode ? "#ffffff" : "#000000",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 200, // Increased to handle >100% (e.g., APTITUDE TEST 3)
        title: { display: true, text: "Avg Mark (% of Pass Mark)", font: { size: 14 }, color: darkMode ? "#ffffff" : "#000000" },
        grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
        ticks: { color: darkMode ? "#ffffff" : "#000000" },
      },
      x: {
        title: { display: true, text: "Test Name", font: { size: 14 }, color: darkMode ? "#ffffff" : "#000000" },
        grid: { display: false },
        ticks: { color: darkMode ? "#ffffff" : "#000000" },
      },
    },
    onClick: handleGraphClick,
  };

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
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-16" : "md:ml-64"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className={`shadow-lg rounded-xl p-6 flex justify-between items-center border-t-4 border-indigo-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h1 className="text-3xl font-bold">Mock Test Analytics</h1>
            <div className="flex items-center gap-4">
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
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-600 text-white hover:bg-indigo-700"} py-2 px-6 rounded-lg transition-colors shadow-md`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>

          <div className={`shadow-lg rounded-xl p-6 border-t-4 border-blue-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="relative w-full md:w-1/3">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by test name..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                />
              </div>
              <div className="relative w-full md:w-1/4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full pl-3 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="w-full md:w-1/4">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                />
              </div>
            </div>
          </div>

          <div className={`shadow-lg rounded-xl p-6 border-t-4 border-teal-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-2xl font-semibold mb-6">Performance Trend</h2>
            <div className="h-80">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>

          <div className={`shadow-lg rounded-xl border-t-4 border-indigo-500 overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Test Overview</h2>
              {filteredTests.length === 0 ? (
                <p className={`text-center py-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No mock tests found for the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`text-sm uppercase tracking-wide ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <tr>
                        <th className="p-4 font-medium">Test Name</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Start Date</th>
                        <th className="p-4 font-medium">Last Date</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Attended</th>
                        <th className="p-4 font-medium">Not Attended</th>
                        <th className="p-4 font-medium">Avg Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTests.map((test) => (
                        <motion.tr
                          key={test._id}
                          className={`border-b hover:bg-gray-700 transition-colors ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className={`p-4 font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>{test.testName}</td>
                          <td className="p-4">{test.testType}</td>
                          <td className="p-4">{new Date(test.startDate).toLocaleDateString()}</td>
                          <td className="p-4">{new Date(test.lastDayToAttend).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${test.isPublished ? (darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800") : (darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800")}`}
                            >
                              {test.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="p-4">{test.attendedCount}</td>
                          <td className="p-4">{test.notAttendedCount}</td>
                          <td className="p-4">{test.avgMark}/{test.passMark} ({test.passMark ? ((parseFloat(test.avgMark) / test.passMark) * 100).toFixed(2) : 0}%)</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedTest && (
              <div className={`p-6 border-t ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                <h3 className="text-xl font-semibold mb-4">
                  Results for {tests.find((t) => t._id === selectedTest)?.testName}
                </h3>
                {tests.find((t) => t._id === selectedTest)?.results.length === 0 ? (
                  <p className={`text-${darkMode ? "gray-400" : "gray-500"}`}>No students have taken this test yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`text-sm uppercase tracking-wide ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                        <tr>
                          <th className="p-3 font-medium">Student Name</th>
                          <th className="p-3 font-medium">Admission No</th>
                          <th className="p-3 font-medium">Mark</th>
                          <th className="p-3 font-medium">Percentage</th>
                          <th className="p-3 font-medium">Passed</th>
                          <th className="p-3 font-medium">Time Taken (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests
                          .find((t) => t._id === selectedTest)
                          ?.results.map((result) => (
                            <motion.tr
                              key={result._id}
                              className={`border-b ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td className="p-3">{result.studentId?.name || "N/A"}</td>
                              <td className="p-3">{result.studentId?.admnNo || "N/A"}</td>
                              <td className="p-3">{result.mark}/{tests.find((t) => t._id === selectedTest)?.passMark}</td>
                              <td className="p-3">{result.percentage.toFixed(2)}%</td>
                              <td className="p-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${result.passed ? (darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800") : (darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800")}`}
                                >
                                  {result.passed ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="p-3">{(result.timeTaken / 60).toFixed(2)}</td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MockTests;