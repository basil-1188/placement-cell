import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaDownload, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const CampusDriveApplicants = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchApplicants = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/campus-drive-applicants/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setApplicants(response.data.data);
          if (response.data.data.length > 0) {
            setJobDetails(response.data.data[0].jobId);
          }
        } else {
          toast.error(response.data.message || "Failed to fetch applicants");
          setApplicants([]);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error.response?.status, error.response?.data);
        toast.error(error.response?.data?.message || "Error fetching applicants");
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [userData, jobId, navigate, backendUrl]);

  const downloadCSV = () => {
    const headers = ["Student Name", "Email", "Average CGPA", "Job Title", "Company"];
    const rows = applicants.map((app) => [
      app.studentId.name,
      app.studentId.email,
      app.averageCgpa || "N/A",
      app.jobId.title,
      app.jobId.company,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${jobDetails.title || "campus_drive"}_applicants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          className="text-xl font-bold text-gray-300"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-20" : "md:ml-72"}`}
      >
        <motion.div
          className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-indigo-600 to-teal-500 text-white"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Applicants for {jobDetails.title} at {jobDetails.company}
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
                onClick={() => navigate("/admin/job-management")}
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-600 hover:bg-indigo-100"} py-2 px-6 rounded-lg font-semibold transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Jobs
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            View and manage campus drive applicants
          </p>
        </motion.div>

        {applicants.length === 0 ? (
          <div className="rounded-xl shadow-md p-6 text-center bg-gray-800">
            <p className="text-lg font-medium text-gray-400">No applicants found for this campus drive.</p>
          </div>
        ) : (
          <div className="rounded-xl shadow-md p-6 bg-gray-800">
            <div className="flex justify-end mb-4">
              <motion.button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload className="h-5 w-5" />
                Download CSV
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Average CGPA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {applicants.map((app) => (
                    <motion.tr
                      key={app._id}
                      className="hover:bg-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{app.studentId.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{app.studentId.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {app.averageCgpa || "N/A"}
                        {app.averageCgpa !== "N/A" && app.averageCgpa < jobDetails.eligibility?.cgpa && (
                          <span className="ml-2 text-red-400 font-semibold">Below Required</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusDriveApplicants;