import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, ""); // Remove trailing slashes
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);

  const value = {
    backendUrl,
    isLogin,
    setIsLogin,
    userData,
    setUserData,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};