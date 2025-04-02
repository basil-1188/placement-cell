import React, { useState, useEffect, useContext, useMemo } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Add axios import
import logo from "../../assets/logo.png";
import { AppContext } from "../../context/AppContext";

const StudentNavbar = () => {
  const { userData, backendUrl, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTest, setHasTest] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/mock-tests/schedule`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        console.log("StudentNavbar - Fetched test schedule:", response.data);
        setHasTest(response.data.success);
      } catch (error) {
        console.error("Error fetching schedule:", error.response ? error.response.data : error.message);
      }
    };
    fetchSchedule();
  }, [backendUrl]);

  console.log("StudentNavbar - userData:", userData);

  const navItems = useMemo(() => {
    if (!userData) {
      return [
        { path: "/login", label: "SIGN IN" },
        { path: "/register", label: "REGISTER" },
        { path: "/blogs", label: "BLOG" },
      ];
    }

    if (userData.role === "student") {
      return [
        { path: "/user/blogs", label: "BLOG" },
        {
          path: "/mock-tests",
          label: "MOCK TESTS",
          dropdown: [
            { path: "/user/mock-tests/take-test", label: "Take Test", condition: hasTest },
            { path: "/user/mock-tests/test-history", label: "Past Results" },
            { path: "/user/mock-tests/ranks", label: "Leaderboard Rankings" },
          ],
        },
        { path: "/user/jobs", label: "JOBS" },
        {
          path: "/study-materials",
          label: "STUDY MATERIALS",
          dropdown: [
            { path: "/user/live-classes", label: "Live Class" },
            { path: "/user/study-resources", label: "Materials" },
            { path: "/user/videos", label: "Videos" },
            { path: "/user/qa", label: "Questions & Answers" }
          ],
        },
        { path: "/ai-interview", label: "AI INTERVIEW" },
      ];
    }
    return [];
  }, [userData, hasTest]);

  useEffect(() => {
    const initialDropdownStates = {};
    navItems.forEach((item) => {
      if (item.dropdown) {
        initialDropdownStates[item.path] = false;
      }
    });
    initialDropdownStates["user-dropdown"] = false;
    setDropdownStates(initialDropdownStates);
  }, [navItems]);

  const toggleDropdown = (path) => {
    setDropdownStates((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  console.log("StudentNavbar - dropdownStates:", dropdownStates);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Nirmala MCA Logo" className="h-12" />
          <span className="text-xl font-semibold text-gray-800">
            Nirmala College, MCA (Student)
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
                      navigate("/login");
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
                    navigate("/login");
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

export default StudentNavbar;