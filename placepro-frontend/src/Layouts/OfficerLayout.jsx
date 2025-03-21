import React from "react";
import { Outlet, Link } from "react-router-dom";

const OfficerLayout = () => {
  return (
    <div>
      <nav>
        <Link to="/officer"></Link>
        <Link to="/officer/profile"></Link>
        <Link to="/officer/mock-tests"></Link>
        <Link to="/officer/reports"></Link>
      </nav>

      <Outlet />
    </div>
  );
};

export default OfficerLayout;
