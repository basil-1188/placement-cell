import React from "react";
import { Outlet, Link } from "react-router-dom";

const UserLayout = () => {
  return (
    <div>
        <nav>
            <Link to="/user"></Link>
            <Link to="/user/profile"></Link>
            <Link to="/user/results"></Link>
            <Link to="/user/mock-test"></Link>
        </nav>


        <Outlet />
    </div>
  );
};

export default UserLayout;
