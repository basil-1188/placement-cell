import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserCircle, FaArrowLeft, FaMoon, FaSun, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminProfile = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", profileImage: "" });
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setProfile(response.data.profile);
          setFormData({
            name: response.data.profile.name,
            profileImage: response.data.profile.profileImage || "",
          });
        } else {
          toast.error(response.data.message || "Failed to fetch profile");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error(error.response?.data?.message || "Error fetching profile");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, userData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${backendUrl}/api/admin/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setProfile(response.data.profile);
        setIsEditing(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setFormData({ name: profile.name, profileImage: profile.profileImage || "" });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`text-xl animate-pulse ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Loading...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"}`}>
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <motion.div
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ${isMinimized ? "md:ml-16" : "md:ml-64"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <div className={`shadow-2xl rounded-2xl p-8 border-t-4 border-indigo-500 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h1 className="text-4xl font-extrabold flex items-center">
                <FaUserCircle className="mr-3 text-indigo-400" /> Admin Profile
              </h1>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
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
                  className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaArrowLeft className="mr-2" /> Back to Dashboard
                </motion.button>
              </div>
            </div>

            <motion.div
              className="flex flex-col items-center md:flex-row md:items-start gap-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0">
                <img
                  src={profile.profileImage || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                />
              </div>
              <div className="flex-1 w-full">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Profile Image URL</label>
                      <input
                        type="url"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      />
                    </div>
                    <div className="flex gap-4">
                      <motion.button
                        type="submit"
                        className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSave className="mr-2" /> Save
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={toggleEdit}
                        className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-300 hover:bg-gray-400"} text-white`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTimes className="mr-2" /> Cancel
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{profile.name}</h2>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Admin</p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <span className="font-medium">Email:</span> {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <span className="font-medium">Joined:</span>{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <span className="font-medium">Last Updated:</span>{" "}
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <motion.button
                      onClick={toggleEdit}
                      className={`flex items-center px-4 py-2 rounded-full ${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} text-white mt-4`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminProfile;