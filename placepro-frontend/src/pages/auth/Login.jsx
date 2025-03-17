// AuthForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const AuthForm = () => {
  const { backendUrl, setIsLogin, setUserData, login } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [localIsLogin, setLocalIsLogin] = useState(location.pathname === "/login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, profilePic: file });
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (localIsLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        navigate("/");
        toast.success("Logged in successfully!");
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        if (formData.profilePic) {
          formDataToSend.append("profileImage", formData.profilePic);
        }

        const response = await axios.post(
          `${backendUrl}/api/auth/register`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setUserData(response.data.user);
          setIsLogin(true);
          localStorage.setItem("isLoggedIn", "true");
          navigate("/", { state: { email: formData.email } });
          toast.success("Registered successfully! Please verify your email.");
        } else {
          toast.error(response.data.message || "Registration failed");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dotSize = 12;

  return (
    <section className="relative mt-15 flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-white overflow-hidden">
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

      <div className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-xl border border-gray-700 max-w-md w-full">
        {!localIsLogin && (
          <div className="flex justify-center mb-4 relative">
            <label className="relative cursor-pointer">
              <motion.div
                className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {preview ? (
                  <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-gray-400 text-4xl" />
                )}
              </motion.div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border border-white shadow-md">
                <FaCamera className="text-white text-sm" />
              </div>
            </label>
          </div>
        )}

        <motion.h2
          className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {localIsLogin ? "Welcome Back!" : "Create Your Account"}
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!localIsLogin && (
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 pl-12 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {localIsLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-purple-400 hover:underline text-sm"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={loading}
          >
            {loading ? "Processing..." : localIsLogin ? "Sign In" : "Register"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          {localIsLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => navigate(localIsLogin ? "/register" : "/login")}
            className="text-purple-400 font-semibold ml-1 hover:underline"
          >
            {localIsLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default AuthForm;