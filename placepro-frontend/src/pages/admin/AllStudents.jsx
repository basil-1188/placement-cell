import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FaMoon, FaSun } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AllStudents = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/full-user-details`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const enrichedStudents = response.data.users.map(student => ({
            ...student,
            batch: getBatchFromAdmnNo(student.admnNo),
          }));
          setStudents(enrichedStudents);
          setFilteredStudents(enrichedStudents);
        } else {
          toast.error(response.data.message || "Failed to fetch student details");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error(error.response?.data?.message || "Error fetching student details");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [backendUrl, userData, navigate]);

  const getBatchFromAdmnNo = (admnNo) => {
    if (!admnNo) return "N/A";
    const prefix = admnNo.slice(0, 2);
    switch (prefix) {
      case "23": return "2023-2025";
      case "24": return "2024-2026";
      default: return "Other";
    }
  };

  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.admnNo || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (batchFilter !== "all") {
      filtered = filtered.filter((student) => student.batch === batchFilter);
    }
    setFilteredStudents(filtered);
  }, [searchTerm, batchFilter, students]);

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/delete-student/${studentId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setStudents(students.filter((s) => s._id !== studentId));
        setFilteredStudents(filteredStudents.filter((s) => s._id !== studentId));
        toast.success("Student deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Error deleting student");
    }
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
        <div className="max-w-7xl mx-auto">
          <div className={`shadow-sm border-b p-6 flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h1 className="text-2xl font-semibold">Student Management</h1>
            <div className="flex items-center space-x-4">
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
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or admission number..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                />
              </div>
              <div className="relative w-full md:w-1/4">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  <option value="all">All Batches</option>
                  <option value="2023-2025">2023-2025</option>
                  <option value="2024-2026">2024-2026</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className={`mt-6 rounded-lg shadow-sm border overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            {filteredStudents.length === 0 ? (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">No students found for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`text-sm uppercase tracking-wide ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <tr>
                      <th className="p-4 font-medium">Profile</th>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Admission No</th>
                      <th className="p-4 font-medium">Batch</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student._id}
                        className={`border-b hover:bg-gray-700 transition-colors ${darkMode ? "border-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-4">
                          <img
                            src={student.profileImage || "https://via.placeholder.com/40"}
                            alt={student.name || "Profile"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="p-4">{student.name || "N/A"}</td>
                        <td className="p-4">{student.admnNo || "N/A"}</td>
                        <td className="p-4">{student.batch}</td>
                        <td className="p-4">{student.email || "N/A"}</td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => setSelectedStudent(student)}
                              className="bg-indigo-600 text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Details
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(student._id)}
                              className="bg-red-600 text-white py-1.5 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (
          <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
              <Dialog.Panel className={`rounded-xl p-6 shadow-xl max-w-lg w-full ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <Dialog.Title className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <img
                    src={selectedStudent.profileImage || "https://via.placeholder.com/40"}
                    alt={selectedStudent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div>{selectedStudent.name || "Unknown"}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{selectedStudent.batch}</div>
                  </div>
                </Dialog.Title>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <p className="font-medium">Email:</p>
                    <p>{selectedStudent.email || "N/A"}</p>
                    <p className="font-medium">Admission No:</p>
                    <p>{selectedStudent.admnNo || "N/A"}</p>
                    <p className="font-medium">Phone:</p>
                    <p>{selectedStudent.phoneNo || "N/A"}</p>
                    <p className="font-medium">DOB:</p>
                    <p>
                      {selectedStudent.dob
                        ? new Date(selectedStudent.dob).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="font-medium">Address:</p>
                    <p>{selectedStudent.address || "N/A"}</p>
                    <p className="font-medium">Degree:</p>
                    <p>{selectedStudent.degree || "N/A"}</p>
                    <p className="font-medium">CGPA:</p>
                    <p>{selectedStudent.degreeCgpa || "N/A"}</p>
                    <p className="font-medium">+2 %:</p>
                    <p>{selectedStudent.plustwoPercent || "N/A"}</p>
                    <p className="font-medium">10th %:</p>
                    <p>{selectedStudent.tenthPercent || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">PG Marks:</p>
                    {selectedStudent.pgMarks && selectedStudent.pgMarks.length > 0 ? (
                      <ul className="list-disc list-inside mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {selectedStudent.pgMarks.map((mark, index) => (
                          <li key={index}>
                            Semester {mark.semester}: {mark.cgpa || "N/A"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">N/A</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      const details = JSON.stringify(selectedStudent, null, 2);
                      navigator.clipboard.writeText(details);
                      toast.success("Details copied to clipboard!");
                    }}
                    className={`py-2 px-4 rounded-md transition-colors ${darkMode ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-600 text-white hover:bg-gray-700"}`}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </motion.div>
    </div>
  );
};

export default AllStudents;