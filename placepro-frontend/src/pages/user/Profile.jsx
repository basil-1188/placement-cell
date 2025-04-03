import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaEnvelope,
  FaLink,
  FaDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        console.log("Profile - Fetching student details from:", `${backendUrl}/api/user/details`);
        console.log("Profile - userData:", userData);
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/user/details`, {
          withCredentials: true,
        });
        console.log("Profile - Fetch response:", response.data);
        if (response.data.success && response.data.data) {
          setStudentDetails(response.data.data);
        } else {
          console.log("Profile - No student details found in response:", response.data);
          toast.error("No student details found. Please upload your details.");
          navigate("/user/upload-details");
        }
      } catch (error) {
        console.error("Profile - Error fetching student details:", error);
        console.log("Profile - Error response:", error.response?.data);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "Failed to load profile details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchStudentDetails();
    } else {
      console.log("Profile - No userData available, redirecting to login");
      toast.error("Please log in to view your profile.");
      navigate("/login");
    }
  }, [backendUrl, userData, navigate]);

  const defaultProfileImage = "https://via.placeholder.com/150?text=Profile+Image";
  const profileImageUrl = userData?.profileImage || defaultProfileImage;
  console.log("Profile - profileImageUrl:", profileImageUrl);

  const handleDownloadResume = async () => {
    if (!studentDetails?.resume) {
      toast.info("No resume uploaded yet.");
      return;
    }

    try {
      const response = await axios.get(studentDetails.resume, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];
      console.log("Resume Content-Type:", contentType);
      if (!contentType.includes("pdf")) {
        console.warn("Unexpected Content-Type:", contentType);
        toast.error("The file does not appear to be a valid PDF.");
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_${studentDetails.admnNo || "user"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download resume. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="relative z-10 max-w-5xl mx-auto pt-20">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          My Profile
        </motion.h1>

        {loading ? (
          <div className="text-center text-gray-600 text-lg animate-pulse">Loading profile...</div>
        ) : studentDetails ? (
          <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 bg-opacity-90 backdrop-blur-lg shadow-2xl rounded-xl p-8 border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute w-48 h-48 bg-purple-500 opacity-20 rounded-full blur-2xl top-4 left-4 animate-pulse"></div>
              <div className="absolute w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-2xl bottom-4 right-4 animate-pulse delay-1000"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10"></div>
            </div>

            <div className="relative z-10">
              <motion.div
                className="flex justify-center mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                  onError={(e) => {
                    console.log("Profile - Image load error, using default");
                    e.target.src = defaultProfileImage;
                  }}
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaUser className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    <span className="text-gray-100">{userData?.name || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaUser className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Admission No:</span>{" "}
                    <span className="text-gray-100">{studentDetails.admnNo || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaPhone className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Phone:</span>{" "}
                    <span className="text-gray-100">{studentDetails.phoneNo || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaGraduationCap className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Degree:</span>{" "}
                    <span className="text-gray-100">{studentDetails.degree || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaGraduationCap className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Degree CGPA:</span>{" "}
                    <span className="text-gray-100">{studentDetails.degreeCgpa || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaGraduationCap className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Plus Two:</span>{" "}
                    <span className="text-gray-100">{studentDetails.plustwoPercent || "Not specified"}%</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaGraduationCap className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Tenth:</span>{" "}
                    <span className="text-gray-100">{studentDetails.tenthPercent || "Not specified"}%</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaEnvelope className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    <span className="text-gray-100">{userData?.email || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-sm">
                  <FaLink className="text-purple-400 mr-4 text-xl" />
                  <div>
                    <span className="font-semibold">GitHub:</span>{" "}
                    <span className="text-gray-100">{studentDetails.githubProfile || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {studentDetails.pgMarks && studentDetails.pgMarks.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-100 mb-4 border-b-2 border-purple-400 pb-2">
                    Postgraduate Marks
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {studentDetails.pgMarks.map((mark, index) => (
                      <li key={index} className="text-gray-200">
                        <span className="font-medium">Semester {mark.semester}:</span>{" "}
                        <span className="text-gray-100">{mark.cgpa} CGPA</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10 flex justify-center">
                {studentDetails.resume && (
                  <motion.button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-md"
                    onClick={handleDownloadResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaDownload className="text-lg" />
                    <span>Download Resume</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-400 bg-red-900 bg-opacity-50 p-6 rounded-lg shadow-md">
            No profile data available. Please{" "}
            <button
              onClick={() => navigate("/user/upload-details")}
              className="text-blue-400 font-medium underline hover:text-blue-300 transition-colors"
            >
              upload your details
            </button>.
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;