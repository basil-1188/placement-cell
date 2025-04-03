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
  FaImage,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";

const StudentDetailsForm = () => {
  const { backendUrl, userData, setUserData } = useContext(AppContext);
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
    profileImage: null,
    pgMarks: [],
  });
  const [newPgMark, setNewPgMark] = useState({ semester: "", cgpa: "" });
  const [existingResume, setExistingResume] = useState(null);
  const [existingProfileImage, setExistingProfileImage] = useState(null);

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
            resume: null,
            profileImage: null,
            pgMarks: data.pgMarks || [],
          });
          setExistingResume(data.resume || null);
          setExistingProfileImage(userData?.profileImage || null);
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
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit!");
        return;
      }
      if (name === "resume" && file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed for resumes!");
        return;
      }
      if (name === "profileImage" && !["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Only JPEG or PNG files are allowed for profile images!");
        return;
      }
      setFormData({ ...formData, [name]: file });
      if (name === "resume") setExistingResume(null);
      if (name === "profileImage") setExistingProfileImage(null);
    }
  };

  const handleDeleteResume = async () => {
    if (!existingResume) {
      toast.info("No resume to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete your resume?")) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/user/delete-resume`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setExistingResume(null);
        toast.success("Resume deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete resume.");
      }
    } catch (error) {
      console.error("Delete resume error:", error);
      toast.error(error.response?.data?.message || "Failed to delete resume.");
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
    if (isNaN(newPgMark.semester) || newPgMark.semester < 1 || newPgMark.semester > 4) {
      toast.error("Semester must be a number between 1 and 4!");
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

    let hasChanges = false;

    // Submit student details and resume if there are changes
    if (
      formData.admnNo ||
      formData.phoneNo ||
      formData.dob ||
      formData.address ||
      formData.degree ||
      formData.degreeCgpa ||
      formData.plustwoPercent ||
      formData.tenthPercent ||
      formData.resume ||
      formData.githubProfile ||
      formData.pgMarks.length > 0
    ) {
      try {
        const studentData = new FormData();
        studentData.append("admnNo", formData.admnNo);
        studentData.append("phoneNo", formData.phoneNo);
        studentData.append("dob", formData.dob);
        studentData.append("address", formData.address);
        studentData.append("degree", formData.degree);
        studentData.append("degreeCgpa", formData.degreeCgpa);
        studentData.append("plustwoPercent", formData.plustwoPercent);
        studentData.append("tenthPercent", formData.tenthPercent);
        studentData.append("githubProfile", formData.githubProfile);
        if (formData.resume) {
          studentData.append("resume", formData.resume);
        }
        studentData.append("pgMarks", JSON.stringify(formData.pgMarks));

        console.log("Submitting student details to:", `${backendUrl}/api/user/details`);
        const studentResponse = await axios.post(`${backendUrl}/api/user/details`, studentData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (studentResponse.data.success) {
          toast.success("Student details added/updated successfully!");
          hasChanges = true;
          setExistingResume(studentResponse.data.data.resume || existingResume);
          setFormData({ ...formData, resume: null }); // Clear resume input
        } else {
          toast.error(studentResponse.data.message || "Failed to update student details");
        }
      } catch (studentError) {
        console.error("Student details submission error:", studentError);
        toast.error(studentError.response?.data?.message || "Failed to update student details");
      }
    }

    // Submit profile image silently if provided
    if (formData.profileImage) {
      try {
        const profileImageData = new FormData();
        profileImageData.append("profileImage", formData.profileImage);

        console.log("Submitting profile image to:", `${backendUrl}/api/user/update-profile-image`);
        const profileResponse = await axios.post(`${backendUrl}/api/user/update-profile-image`, profileImageData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (profileResponse.data.success) {
          // No toast here - keep it silent
          setUserData({ ...userData, profileImage: profileResponse.data.profileImage });
          setExistingProfileImage(profileResponse.data.profileImage);
          setFormData({ ...formData, profileImage: null }); // Clear profile image input
          hasChanges = true;
        } else {
          console.error("Profile image update failed:", profileResponse.data.message);
          // No error toast - log it silently
        }
      } catch (profileError) {
        console.error("Profile image upload error:", profileError);
        // No error toast - log it silently
      }
    }

    if (hasChanges) {
      navigate("/user/profile");
    } else {
      toast.info("No changes submitted");
    }

    setLoading(false);
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
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {existingResume && !formData.resume && (
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-400 text-sm">
                    Existing Resume: <span className="text-gray-200">{existingResume.split("/").pop()}</span>
                  </p>
                  <motion.button
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center space-x-2"
                    onClick={handleDeleteResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash className="text-sm" />
                    <span>Delete Resume</span>
                  </motion.button>
                </div>
              )}
            </div>

            <div className="relative md:col-span-2">
              <FaImage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="file"
                name="profileImage"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {existingProfileImage && !formData.profileImage && (
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-400 text-sm">
                    Existing Profile Image: <span className="text-gray-200">{existingProfileImage.split("/").pop()}</span>
                  </p>
                </div>
              )}
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
                  placeholder="Semester (1-4)"
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