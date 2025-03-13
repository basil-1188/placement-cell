import React from "react";
import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
        <nav>
            <Link to="/admin"></Link>
            <Link to="/admin/reports"></Link>
            <Link to="/admin/robotic-interview"></Link>
        </nav>

        <Outlet />
    </div>
  );
};

export default AdminLayout;
