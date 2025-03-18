import React, { useState, useEffect, useContext } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { userData, backendUrl, logout } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTest, setHasTest] = useState(false); 
  const [dropdownStates, setDropdownStates] = useState({}); 

  useEffect(() => {
    fetch(`${backendUrl}/api/mock-tests/schedule`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched test schedule:", data); // Debug API response
        setHasTest(data.success);
      })
      .catch((error) => console.error("Error fetching schedule:", error));
  }, [backendUrl]);

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
          {
            path: "/mock-tests",
            label: "MOCK TESTS",
            dropdown: [
              { path: "/mock-tests/marks", label: "Past Results" },
              { path: "/mock-tests/ranks", label: "Leaderboard Rankings" },
              { path: "/mock-tests/new-test", label: "Take Scheduled Test", condition: hasTest },
            ],
          },
          {
            path: "/study-materials",
            label: "STUDY MATERIALS",
            dropdown: [
              { path: "/study-materials/resources", label: "Materials" },
              { path: "/study-materials/videos", label: "Videos" },
              { path: "/study-materials/qa", label: "Questions & Answers" },
            ],
          },
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
          {
            path: "/study-materials",
            label: "STUDY MATERIALS",
            dropdown: [
              { path: "/study-materials/resources", label: "Materials" },
              { path: "/study-materials/videos", label: "Videos" },
              { path: "/study-materials/qa", label: "Questions & Answers" },
            ],
          },
          { path: "/upload-videos", label: "UPLOAD VIDEOS" },
          { path: "/resume-review", label: "RESUME REVIEW" },
        ];
      default:
        console.log("getNavItems - Unknown role, returning empty array");
        return [];
    }
  };

  const navItems = getNavItems();
  useEffect(() => {
    const initialDropdownStates = {};
    navItems.forEach((item) => {
      if (item.dropdown) {
        initialDropdownStates[item.path] = false; // Initialize each dropdown as closed
      }
    });
    initialDropdownStates["user-dropdown"] = false; // Initialize user dropdown
    setDropdownStates(initialDropdownStates);
  }, []); // Run once on mount

  console.log("getNavItems result:", navItems); // Debug nav items
  console.log("dropdownStates:", dropdownStates); // Debug dropdown states

  // Helper function to toggle dropdown state
  const toggleDropdown = (path) => {
    console.log("Toggling dropdown for:", path); // Debug toggle
    setDropdownStates((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

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
            <li key={item.path} className="relative">
              {item.dropdown ? (
                <div className="dropdown">
                  <button
                    className="hover:text-blue-500 focus:outline-none"
                    onClick={() => toggleDropdown(item.path)}
                  >
                    {item.label}
                  </button>
                  {dropdownStates[item.path] && (
                    <ul className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md">
                      {item.dropdown.map((dropdownItem) => (
                        <li
                          key={dropdownItem.path}
                          className="dropdown-item"
                          style={{
                            display:
                              dropdownItem.condition === false ? "none" : "block",
                          }}
                        >
                          <Link
                            to={dropdownItem.path}
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => toggleDropdown(item.path)}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link to={item.path} className="hover:text-blue-500">
                  {item.label}
                </Link>
              )}
            </li>
          ))}

          {userData && (
            <li className="relative">
              <button
                onClick={() => toggleDropdown("user-dropdown")}
                className="flex items-center space-x-2 hover:text-blue-500 transition duration-300"
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                  {userData?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              {dropdownStates["user-dropdown"] && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                  <Link
                    to="/user/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => toggleDropdown("user-dropdown")}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/user/upload-details"
                    className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                    onClick={() => toggleDropdown("user-dropdown")}
                  >
                    Upload Details
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      toggleDropdown("user-dropdown");
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

        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FaTimes className="text-gray-700" />
          ) : (
            <FaBars className="text-gray-700" />
          )}
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
            <li key={item.path} className="relative">
              {item.dropdown ? (
                <div className="dropdown">
                  <button
                    className="hover:text-blue-500 focus:outline-none"
                    onClick={() => toggleDropdown(item.path)}
                  >
                    {item.label}
                  </button>
                  {dropdownStates[item.path] && (
                    <ul className="mt-2 w-48 bg-white shadow-md rounded-md">
                      {item.dropdown.map((dropdownItem) => (
                        <li
                          key={dropdownItem.path}
                          className="dropdown-item"
                          style={{
                            display:
                              dropdownItem.condition === false ? "none" : "block",
                          }}
                        >
                          <Link
                            to={dropdownItem.path}
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setIsOpen(false);
                              toggleDropdown(item.path);
                            }}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}

          {userData && (
            <>
              <li>
                <Link
                  to="/user/profile"
                  className="hover:text-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/user/upload-details"
                  className="hover:text-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  Upload Details
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