import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaCamera } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, profilePic: file });
      setPreview(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          navigate("/profile"); 
        } else {
          setError(response.data.message);
        }
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        if (formData.profilePic) {
          formDataToSend.append("profilePic", formData.profilePic);
        }

        const response = await axios.post("http://localhost:5000/api/auth/register", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          navigate("/otp-verification", { state: { email: formData.email } });
        } else {
          setError(response.data.message);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <section className="flex mt-15 items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-800 text-white overflow-hidden relative">
      <div className="relative z-10 bg-gray-800 bg-opacity-85 p-10 rounded-3xl shadow-2xl max-w-md w-full border border-blue-500/60 backdrop-blur-md">
        {/* Profile Picture Upload (Only for Register) */}
        {!isLogin && (
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border border-white shadow-md">
                <FaCamera className="text-white text-sm" />
              </div>
            </label>
          </div>
        )}

        <motion.h2
          className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </motion.h2>

        {error && (
          <motion.p
            className="text-red-400 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-xl" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                required
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-xl" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 pl-12 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-xl" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 pl-12 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
          >
            {isLogin ? "Sign In" : "Register"}
          </motion.button>
        </form>

        {/* Toggle Login/Register */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 font-semibold ml-1 hover:underline transition duration-300"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default AuthForm;