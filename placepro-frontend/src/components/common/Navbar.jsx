import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Nirmala MCA Logo" className="h-12" />
          <span className="text-xl font-semibold text-gray-800">Nirmala College, MCA Department</span>
        </Link>

        <ul className="hidden md:flex space-x-8 text-lg font-medium">
          <li><Link to="/signin" className="hover:text-blue-500 transition duration-300">SIGN IN</Link></li>
          <li><Link to="/register" className="hover:text-blue-500 transition duration-300">REGISTRATION</Link></li>
          <li><Link to="/about_us" className="hover:text-blue-500 transition duration-300">ABOUT</Link></li>
          <li><Link to="/blog" className="hover:text-blue-500 transition duration-300">BLOG</Link></li>
          <li><Link to="/contact_us" className="hover:text-blue-500 transition duration-300">CONTACT</Link></li>
        </ul>

        <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes className="text-gray-700" /> : <FaBars className="text-gray-700" />}
        </button>

      </div>

      <div className={`fixed top-0 left-0 w-full h-full bg-white transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
        <div className="flex justify-end p-6">
          <button onClick={() => setIsOpen(false)}>
            <FaTimes className="text-3xl text-gray-700" />
          </button>
        </div>
        <ul className="flex flex-col items-center space-y-6 text-xl font-medium">
          <li><Link to="/signin" className="hover:text-blue-500" onClick={() => setIsOpen(false)}>SIGN IN</Link></li>
          <li><Link to="/register" className="hover:text-blue-500" onClick={() => setIsOpen(false)}>REGISTRATION</Link></li>
          <li><Link to="/about_us" className="hover:text-blue-500" onClick={() => setIsOpen(false)}>ABOUT</Link></li>
          <li><Link to="/blog" className="hover:text-blue-500" onClick={() => setIsOpen(false)}>BLOG</Link></li>
          <li><Link to="/contact" className="hover:text-blue-500" onClick={() => setIsOpen(false)}>CONTACT</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
