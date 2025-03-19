// src/components/common/Navbar.jsx
import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/login", label: "SIGN IN" },
    { path: "/register", label: "REGISTER" },
    { path: "/blog", label: "BLOG" },
  ];

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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;