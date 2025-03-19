// src/pages/auth/Login.jsx
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const AuthForm = () => {
  const { backendUrl, setIsLogin, login, getAuthState } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [localIsLogin, setLocalIsLogin] = useState(location.pathname === "/login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: null,
  });
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
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (localIsLogin) {
        const loginResult = await login({
          email: formData.email,
          password: formData.password,
        });
        console.log("Login result:", loginResult);
        if (loginResult.success) {
          await getAuthState(); // This should now work
          console.log("User role:", loginResult.user?.role);
          const redirectPath = loginResult.user?.role === "admin" ? "/admin" : "/";
          console.log("Redirecting to:", redirectPath);
          navigate(redirectPath);
          toast.success("Logged in successfully!");
        } else {
          toast.error(loginResult.message || "Login failed");
        }
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
        console.log("Register response:", response.data);
        if (response.data.success) {
          setIsLogin(true);
          await getAuthState();
          console.log("Registered user role:", response.data.user?.role);
          const redirectPath = response.data.user?.role === "admin" ? "/admin" : "/";
          navigate(redirectPath);
          toast.success("Registered successfully! Please verify your email.");
        } else {
          toast.error(response.data.message || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {localIsLogin ? "Sign In" : "Register"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!localIsLogin && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          )}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          {!localIsLogin && (
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Processing..." : localIsLogin ? "Sign In" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center">
          {localIsLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => navigate(localIsLogin ? "/register" : "/login")}
            className="text-blue-500 ml-1 hover:underline"
          >
            {localIsLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default AuthForm;