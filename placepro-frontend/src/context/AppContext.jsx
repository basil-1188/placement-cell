import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthState = async () => {
    try {
      console.log("Checking auth at:", `${backendUrl}/api/auth/is-auth`);
      const response = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });
      console.log("Auth response:", response.data);
      if (response.data.success) {
        setIsLogin(true);
        setUserData(response.data.user);
      } else {
        setIsLogin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("getAuthState error:", error.response?.data || error.message);
      setIsLogin(false);
      setUserData(null);
    } finally {
      setLoading(false);
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
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred during login";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out at:", `${backendUrl}/api/auth/logout`);
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      setIsLogin(false);
      setUserData(null);
      navigate("/login");
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
      value={{
        backendUrl,
        isLogin,
        setIsLogin,
        userData,
        login,
        logout,
        getAuthState,
        isTestActive,
        setIsTestActive,
        loading,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};