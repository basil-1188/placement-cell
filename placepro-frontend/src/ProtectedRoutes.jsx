// src/ProtectedRoutes.jsx (assumed)
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "./context/AppContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { userData } = useContext(AppContext);
  console.log("ProtectedRoute - userData:", userData);

  if (!userData) {
    console.log("No userData, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userData.role)) {
    console.log("Role not allowed:", userData.role);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;