// Navbar.jsx
import React, { useState, useContext } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { userData, backendUrl, logout } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log("Navbar - userData:", userData); // Debug userData
  console.log("Navbar - userData.role:", userData?.role); // Debug role

  const getNavItems = () => {
    if (!userData) {
      console.log("getNavItems - No userData, showing unauthenticated links");
      return [
        { path: "/login", label: "SIGN IN" },
        { path: "/register", label: "REGISTER" },
        { path: "/blog", label: "BLOG" },
      ];
    }

    console.log("getNavItems - Role:", userData.role);
    switch (userData.role) {
      case "student":
        return [
          { path: "/blog", label: "BLOG" },
          { path: "/mock-tests", label: "MOCK TESTS" },
          { path: "/study-materials", label: "STUDY MATERIALS" },
          { path: "/ai-interview", label: "AI INTERVIEW" },
        ];
      case "placement_officer":
        return [
          { path: "/blog", label: "BLOG" },
          { path: "/mock-tests", label: "MOCK TESTS" },
          { path: "/job-openings", label: "JOB OPENINGS" },
          { path: "/rank-students", label: "RANK STUDENTS" },
        ];
      case "training_team":
        return [
          { path: "/blog", label: "BLOG" },
          { path: "/study-materials", label: "STUDY MATERIALS" },
          { path: "/upload-videos", label: "UPLOAD VIDEOS" },
          { path: "/resume-review", label: "RESUME REVIEW" },
        ];
      default:
        console.log("getNavItems - Unknown role, returning empty array");
        return [];
    }
  };

  const navItems = getNavItems();
  console.log("getNavItems result:", navItems); // Debug nav items

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Nirmala MCA Logo" className="h-12" />
          <span className="text-xl font-semibold text-gray-800">
            Nirmala College, MCA
          </span>
        </Link>

        <ul className="hidden md:flex space-x-8 text-lg font-medium">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="hover:text-blue-500">
                {item.label}
              </Link>
            </li>
          ))}

          {userData && (
            <li className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 hover:text-blue-500 transition duration-300"
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                  {userData?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>

        <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes className="text-gray-700" /> : <FaBars className="text-gray-700" />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 w-full h-full bg-white transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-end p-6">
          <button onClick={() => setIsOpen(false)}>
            <FaTimes className="text-3xl text-gray-700" />
          </button>
        </div>
        <ul className="flex flex-col items-center space-y-6 text-xl font-medium">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="hover:text-blue-500"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {userData && (
            <>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="hover:text-red-500"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;