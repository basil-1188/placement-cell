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
          await getAuthState();
          console.log("User role:", loginResult.user?.role);
          const redirectPath = loginResult.user?.role === "admin" ? "/admin" : "/";
          console.log("Redirecting to:", redirectPath);
          navigate(redirectPath);
          toast.success("Logged in successfully!");
        } else {
          toast.error(loginResult.message);
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
    <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f5f7ff] relative overflow-hidden">
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-30px) translateX(20px); }
            50% { transform: translateY(0) translateX(40px); }
            75% { transform: translateY(30px) translateX(20px); }
            100% { transform: translateY(0) translateX(0); }
          }
          .float-1 { animation: float 8s ease-in-out infinite; }
          .float-2 { animation: float 10s ease-in-out infinite 1s; }
          .float-3 { animation: float 12s ease-in-out infinite 2s; }
          .float-4 { animation: float 9s ease-in-out infinite 3s; }
        `}
      </style>
      <div className="absolute inset-0 z-0">
        <div className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-60 float-1 top-[10%] left-[15%]"></div>
        <div className="absolute w-32 h-32 bg-pink-200 rounded-full opacity-60 float-2 bottom-[15%] right-[20%]"></div>
        <div className="absolute w-28 h-28 bg-purple-200 rounded-full opacity-60 float-3 top-[40%] left-[60%]"></div>
        <div className="absolute w-20 h-20 bg-yellow-200 rounded-full opacity-60 float-4 top-[70%] left-[30%]"></div>
      </div>
      <div className={`relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transition-all duration-300 hover:shadow-[0_0_25px_rgba(74,108,250,0.3)] ${!localIsLogin ? "mt-[60px]" : ""}`}>
        <h2 className="text-4xl font-extrabold text-center mb-8 text-[#4a6cfa] animate-fade-in">
          {localIsLogin ? "Hello Again!" : "Let’s Begin!"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!localIsLogin && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-[#f8faff] text-gray-800 border-2 border-[#e0e7ff] rounded-lg focus:border-[#4a6cfa] focus:ring-2 focus:ring-[#bfdbfe] transition-all duration-300"
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
              className="w-full p-3 bg-[#f8faff] text-gray-800 border-2 border-[#e0e7ff] rounded-lg focus:border-[#4a6cfa] focus:ring-2 focus:ring-[#bfdbfe] transition-all duration-300"
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
              className="w-full p-3 bg-[#f8faff] text-gray-800 border-2 border-[#e0e7ff] rounded-lg focus:border-[#4a6cfa] focus:ring-2 focus:ring-[#bfdbfe] transition-all duration-300"
              required
            />
          </div>
          {!localIsLogin && (
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 text-gray-700 bg-[#f8faff] border-2 border-[#e0e7ff] rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#dbe9ff] file:text-[#4a6cfa] hover:file:bg-[#bfdbfe] transition-all duration-300"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-lg transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#4a6cfa] hover:bg-[#3b58e0] hover:shadow-[0_8px_20px_rgba(74,108,250,0.5)]"}`}
          >
            {loading ? "Processing..." : localIsLogin ? "Sign In" : "Register"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          {localIsLogin ? "Join the party?" : "Back to login?"}
          <button
            onClick={() => navigate(localIsLogin ? "/register" : "/login")}
            className="ml-1 text-[#4a6cfa] font-semibold hover:text-[#3b58e0] hover:underline transition-all duration-300"
          >
            {localIsLogin ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default AuthForm;