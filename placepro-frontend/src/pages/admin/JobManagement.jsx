import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaBriefcase, FaCalendarAlt, FaUsers, FaLink, FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const JobManagement = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/jobs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setJobs(response.data.data);
          setFilteredJobs(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch jobs");
          setTimeout(() => navigate("/admin"), 2000);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error.response?.status, error.response?.data);
        toast.error(error.response?.data?.message || "Error fetching jobs");
        setTimeout(() => navigate("/admin"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userData, navigate, backendUrl]);

  useEffect(() => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((job) =>
        typeFilter === "campus" ? job.isCampusDrive : !job.isCampusDrive
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }
    setFilteredJobs(filtered);
  }, [searchTerm, typeFilter, statusFilter, jobs]);

  const handleViewApplicants = (jobId) => {
    navigate(`/admin/campus-drive-applicants/${jobId}`);
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
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
              <FaBriefcase className="mr-3" /> Job Management
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
                className={`${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-600 hover:bg-indigo-100"} py-2 px-6 rounded-lg font-semibold transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
          <p className={`mt-2 text-base opacity-80 ${darkMode ? "text-gray-400" : "text-white"}`}>
            Monitor job postings and campus drive applicants
          </p>
        </motion.div>

        <div className="rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row gap-4 bg-gray-800">
          <div className="relative flex-1">
            <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or company..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-700 border-gray-600 text-white"
          >
            <option value="all">All Types</option>
            <option value="campus">Campus Drives</option>
            <option value="external">External Jobs</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-700 border-gray-600 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full rounded-xl shadow-md p-6 text-center bg-gray-800">
              <p className="text-lg font-medium text-gray-400">No jobs found matching your criteria.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                className={`rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-gray-800 ${job.isCampusDrive ? "border-l-4 border-teal-500" : "border-l-4 border-indigo-500"}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-4">
                  <h2 className="text-xl font-bold truncate">{job.title}</h2>
                  <p className="text-sm mt-1 text-gray-400">{job.company}</p>
                  <p className="text-xs mt-1 flex items-center text-gray-500">
                    <FaCalendarAlt className="mr-2" /> Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${job.status === "open" ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="p-4 text-sm space-y-2 bg-gray-700 text-gray-400">
                  <p>
                    <span className="font-medium text-gray-200">Type:</span> {job.isCampusDrive ? "Campus Drive" : "External Job"}
                  </p>
                  <p className="truncate">
                    <span className="font-medium text-gray-200">Description:</span> {job.description}
                  </p>
                  <p>
                    <span className="font-medium text-gray-200">Eligibility:</span> CGPA {job.eligibility.cgpa}, Skills: {job.eligibility.skills.join(", ")}
                  </p>
                  {job.isCampusDrive && (
                    <>
                      <p>
                        <span className="font-medium text-gray-200">Applicants:</span> {job.applicantCount || 0}
                      </p>
                      <p>
                        <span className="font-medium text-gray-200">Avg CGPA:</span> {job.averageCgpa ? job.averageCgpa.toFixed(2) : "N/A"}
                        {job.averageCgpa && job.averageCgpa < job.eligibility.cgpa && (
                          <span className="ml-2 text-red-400 font-semibold">Below Required</span>
                        )}
                      </p>
                    </>
                  )}
                  {!job.isCampusDrive && job.applyLink && (
                    <p className="truncate">
                      <span className="font-medium text-gray-200">Apply:</span>{" "}
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                        {job.applyLink}
                      </a>
                    </p>
                  )}
                </div>
                <div className="p-4 flex gap-2">
                  {job.isCampusDrive && (
                    <motion.button
                      onClick={() => handleViewApplicants(job._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaUsers className="h-5 w-5" />
                      Applicants
                    </motion.button>
                  )}
                  {!job.isCampusDrive && job.applyLink && (
                    <motion.button
                      onClick={() => window.open(job.applyLink, "_blank")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaLink className="h-5 w-5" />
                      Apply
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;