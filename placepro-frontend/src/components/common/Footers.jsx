import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footers = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          <div>
            <h2 className="text-2xl font-bold">Nirmala MCA Placement</h2>
            <p className="mt-2 text-gray-400">Empowering students for a brighter future.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li><a href="/" className="hover:text-gray-300">Home</a></li>
              <li><a href="#" className="hover:text-gray-300">Job Openings</a></li>
              <li><a href="#" className="hover:text-gray-300">Mock Interviews</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-2 flex justify-center md:justify-start space-x-4">
              <a href="#" className="hover:text-blue-400"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-blue-300"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-pink-400"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-blue-500"><FaLinkedin size={20} /></a>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 mt-6 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Nirmala MCA Placement. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footers;
