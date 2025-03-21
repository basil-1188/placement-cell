import React from "react";
import { Outlet, Link } from "react-router-dom";

const TeamLayout = () => {
  return (
    <div>
      <nav>
        <Link to="/team"></Link>
        <Link to="/team/profile"></Link>
        <Link to="/team/resources"></Link>
        <Link to="/team/interviews"></Link>
      </nav>

      <Outlet />
    </div>
  );
};

export default TeamLayout;
