import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, ""); // Remove trailing slashes

  const [isLogin, setIsLogin] = useState(false); // Default to false
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    try {
      console.log("Checking authentication at:", `${backendUrl}/api/auth/is-auth`);
      const response = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });
      console.log("Auth response:", response.data);
      if (response.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLogin(true);
        const user = await getUserData();
        if (user) {
          console.log("Setting userData after auth check:", user);
          setUserData(user); // Only set if user data is valid
        }
      } else {
        console.log("Authentication failed:", response.data.message);
        setIsLogin(false);
        localStorage.removeItem("isLoggedIn");
        setUserData(null);
      }
    } catch (error) {
      console.error("getAuthState error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        headers: error.config?.headers,
      });
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to check authentication status");
      }
      setIsLogin(false);
      localStorage.removeItem("isLoggedIn");
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
      if (data.success) {
        console.log("Setting userData:", data.userData);
        return data.userData;
      } else {
        toast.error(data.message || "Failed to fetch user data");
        return null;
      }
    } catch (error) {
      console.error("getUserData error:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch user data");
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      console.log("Attempting login with credentials:", credentials);
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, credentials, {
        withCredentials: true,
      });
      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLogin(true);
        console.log("Login successful, setting userData:", data.user);
        setUserData(data.user); // Set userData directly from login response
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out with URL:", `${backendUrl}/api/auth/logout`);
      const response = await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      console.log("Logout response:", response.data);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      setIsLogin(false);
      setUserData(null);
      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    console.log("isLogin updated to:", isLogin);
    localStorage.setItem("isLoggedIn", isLogin);
  }, [isLogin]);

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLogin,
    setIsLogin,
    userData,
    setUserData,
    getAuthState,
    getUserData,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};