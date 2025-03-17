import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaPercentage,
  FaLink,
  FaFileUpload,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";

const StudentDetailsForm = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admnNo: "",
    phoneNo: "",
    dob: "",
    address: "",
    degree: "",
    degreeCgpa: "",
    plustwoPercent: "",
    tenthPercent: "",
    githubProfile: "",
    resume: null,
    pgMarks: [],
  });
  const [newPgMark, setNewPgMark] = useState({ semester: "", cgpa: "" });

  // Fetch existing student details on page load
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        console.log("Fetching student details from:", `${backendUrl}/api/user/details`);
        const response = await axios.get(`${backendUrl}/api/user/details`, {
          withCredentials: true,
        });
        console.log("Fetch response:", response.data);
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setFormData({
            admnNo: data.admnNo || "",
            phoneNo: data.phoneNo || "",
            dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
            address: data.address || "",
            degree: data.degree || "",
            degreeCgpa: data.degreeCgpa || "",
            plustwoPercent: data.plustwoPercent || "",
            tenthPercent: data.tenthPercent || "",
            githubProfile: data.githubProfile || "",
            resume: null, // Resume is not pre-filled for security
            pgMarks: data.pgMarks || [],
          });
          toast.info("Details already entered. You can update them below.");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        if (error.response?.status === 401) {
          toast.error("Please log in to continue.");
          navigate("/login");
        }
      }
    };
    if (userData) fetchStudentDetails();
  }, [backendUrl, userData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit!");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ].includes(file.type)
      ) {
        toast.error("Only PDF and DOC/DOCX files are allowed!");
        return;
      }
      setFormData({ ...formData, resume: file });
    }
  };

  const handlePgMarkChange = (e) => {
    const { name, value } = e.target;
    setNewPgMark({ ...newPgMark, [name]: value });
  };

  const addPgMark = () => {
    if (!newPgMark.semester || !newPgMark.cgpa) {
      toast.error("Please fill in both semester and CGPA!");
      return;
    }
    if (isNaN(newPgMark.semester) || newPgMark.semester < 1 || newPgMark.semester > 8) {
      toast.error("Semester must be a number between 1 and 8!");
      return;
    }
    if (isNaN(newPgMark.cgpa) || newPgMark.cgpa < 0 || newPgMark.cgpa > 10) {
      toast.error("CGPA must be a number between 0 and 10!");
      return;
    }
    setFormData({
      ...formData,
      pgMarks: [...formData.pgMarks, { semester: parseInt(newPgMark.semester), cgpa: parseFloat(newPgMark.cgpa) }],
    });
    setNewPgMark({ semester: "", cgpa: "" });
  };

  const removePgMark = (index) => {
    setFormData({
      ...formData,
      pgMarks: formData.pgMarks.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("admnNo", formData.admnNo);
      data.append("phoneNo", formData.phoneNo);
      data.append("dob", formData.dob);
      data.append("address", formData.address);
      data.append("degree", formData.degree);
      data.append("degreeCgpa", formData.degreeCgpa);
      data.append("plustwoPercent", formData.plustwoPercent);
      data.append("tenthPercent", formData.tenthPercent);
      data.append("githubProfile", formData.githubProfile);
      if (formData.resume) {
        data.append("resume", formData.resume);
      }
      data.append("pgMarks", JSON.stringify(formData.pgMarks));

      console.log("Submitting to:", `${backendUrl}/api/user/details`);
      const response = await axios.post(`${backendUrl}/api/user/details`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Student details added/updated successfully!");
        navigate("/user/profile");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dotSize = 12;

  return (
    <section className="relative mt-25 flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-white overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-black rounded-full opacity-50"
          initial={{
            x: Math.random() * (window.innerWidth - dotSize),
            y: Math.random() * (window.innerHeight - dotSize),
          }}
          animate={{
            x: Math.random() * (window.innerWidth - dotSize),
            y: Math.random() * (window.innerHeight - dotSize),
          }}
          transition={{
            duration: Math.random() * 6 + 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-xl border border-gray-700 max-w-4xl w-full">
        <motion.h2
          className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Upload Your Details
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="text"
                name="admnNo"
                placeholder="Admission Number"
                value={formData.admnNo}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="tel"
                name="phoneNo"
                placeholder="Phone Number"
                value={formData.phoneNo}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="text"
                name="degree"
                placeholder="Degree (e.g., MCA)"
                value={formData.degree}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaPercentage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="number"
                step="0.1"
                name="degreeCgpa"
                placeholder="Degree CGPA (e.g., 8.5)"
                value={formData.degreeCgpa}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaPercentage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="number"
                step="0.1"
                name="plustwoPercent"
                placeholder="Plus Two Percentage (e.g., 85)"
                value={formData.plustwoPercent}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaPercentage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="number"
                step="0.1"
                name="tenthPercent"
                placeholder="Tenth Percentage (e.g., 90)"
                value={formData.tenthPercent}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="url"
                name="githubProfile"
                placeholder="GitHub Profile (optional)"
                value={formData.githubProfile}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="relative md:col-span-2">
              <FaMapMarkerAlt className="absolute left-4 top-4 text-purple-400 text-lg" />
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>

            <div className="relative md:col-span-2">
              <FaFileUpload className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-300">Postgraduate Marks (optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
                <input
                  type="number"
                  name="semester"
                  placeholder="Semester (1-8)"
                  value={newPgMark.semester}
                  onChange={handlePgMarkChange}
                  className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <FaPercentage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
                <input
                  type="number"
                  step="0.1"
                  name="cgpa"
                  placeholder="CGPA (0-10)"
                  value={newPgMark.cgpa}
                  onChange={handlePgMarkChange}
                  className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={addPgMark}
                className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center"
              >
                <FaPlus />
              </button>
            </div>
            {formData.pgMarks.length > 0 && (
              <ul className="space-y-2">
                {formData.pgMarks.map((mark, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-xl text-gray-300">
                    <span>Semester {mark.semester}: {mark.cgpa} CGPA</span>
                    <button
                      type="button"
                      onClick={() => removePgMark(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Details"}
          </motion.button>
        </form>
      </div>
    </section>
  );
};

export default StudentDetailsForm;