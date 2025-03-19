// src/context/AppContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Add this

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); // Add this

  const getAuthState = async () => {
    try {
      console.log("Checking auth at:", `${backendUrl}/api/auth/is-auth`);
      const response = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });
      console.log("Auth response:", response.data);
      if (response.data.success) {
        setIsLogin(true);
        const user = await getUserData();
        if (user) setUserData(user);
      } else {
        setIsLogin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("getAuthState error:", error.response?.data || error.message);
      setIsLogin(false);
      setUserData(null);
    }
  };

  const getUserData = async () => {
    try {
      console.log("Fetching user data from:", `${backendUrl}/api/user/data`);
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });
      console.log("User data response:", data);
      return data.success ? data.userData : null;
    } catch (error) {
      console.error("getUserData error:", error.response?.data || error.message);
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      console.log("Attempting login with:", credentials);
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, credentials, {
        withCredentials: true,
      });
      console.log("Login response:", data);
      if (data.success) {
        setIsLogin(true);
        setUserData(data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out at:", `${backendUrl}/api/auth/logout`);
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      setIsLogin(false);
      setUserData(null);
      navigate("/login"); // Use navigate instead of window.location.href
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  return (
    <AppContext.Provider
      value={{ backendUrl, isLogin, setIsLogin, userData, login, logout, getAuthState }}
    >
      {props.children}
    </AppContext.Provider>
  );
};