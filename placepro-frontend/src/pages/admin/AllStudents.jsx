import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AllStudents = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
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
          setStudents(response.data.users);
          setFilteredStudents(response.data.users);
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

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.admnNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <motion.div
        className={`flex-1 p-6 transition-all duration-300 ${
          isMinimized ? "md:ml-16" : "md:ml-64"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r mt-12 from-blue-700 to-blue-900 text-white p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-center">Student Management Dashboard</h1>
            <p className="mt-1 text-blue-200 text-center">Manage and view student details</p>
          </div>

          <div className="mt-6">
            <div className="mb-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or admission number..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-500">No students found.</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-4 font-semibold">Profile</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Admission No</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
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
                        <td className="p-4">{student.email || "N/A"}</td>
                        <td className="p-4">
                          <button className="text-blue-600 hover:underline">View Details</button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Back Button */}
            <div className="mt-6 text-center">
              <motion.button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full">
                <Dialog.Title className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <img
                    src={selectedStudent.profileImage || "https://via.placeholder.com/40"}
                    alt={selectedStudent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedStudent.name || "Unknown"}
                </Dialog.Title>
                <div className="space-y-3 text-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Email:</strong></p>
                    <p>{selectedStudent.email || "N/A"}</p>
                    <p><strong>Admission No:</strong></p>
                    <p>{selectedStudent.admnNo || "N/A"}</p>
                    <p><strong>Phone:</strong></p>
                    <p>{selectedStudent.phoneNo || "N/A"}</p>
                    <p><strong>DOB:</strong></p>
                    <p>
                      {selectedStudent.dob
                        ? new Date(selectedStudent.dob).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p><strong>Address:</strong></p>
                    <p>{selectedStudent.address || "N/A"}</p>
                    <p><strong>Degree:</strong></p>
                    <p>{selectedStudent.degree || "N/A"}</p>
                    <p><strong>CGPA:</strong></p>
                    <p>{selectedStudent.degreeCgpa || "N/A"}</p>
                    <p><strong>+2 %:</strong></p>
                    <p>{selectedStudent.plustwoPercent || "N/A"}</p>
                    <p><strong>10th %:</strong></p>
                    <p>{selectedStudent.tenthPercent || "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>PG Marks:</strong></p>
                    {selectedStudent.pgMarks && selectedStudent.pgMarks.length > 0 ? (
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {selectedStudent.pgMarks.map((mark, index) => (
                          <li key={index}>
                            Semester {mark.semester}: {mark.cgpa || "N/A"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm">N/A</p>
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
                    className="bg-gray-600 text-white py-1 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="bg-red-600 text-white py-1 px-4 rounded-md hover:bg-red-700 transition-colors"
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