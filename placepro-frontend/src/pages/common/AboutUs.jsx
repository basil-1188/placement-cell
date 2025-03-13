import React from 'react'
import { FaUniversity, FaUserTie } from 'react-icons/fa';

import AdminImage from '../../assets/administrator.jpg'
import ViceAdminImage from '../../assets/vice-administrator.jpg'
import College from '../../assets/college.jpg'


const AboutUs = () => {
  return (
    <section className="relative w-full bg-gradient-to-b from-gray-100 to-white py-24 pt-28 md:pt-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-gray-700 text-lg md:text-xl">A Legacy of Excellence in Higher Education</p>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <p className="mt-4 text-gray-700 text-lg">
              Established in 1953, Nirmala College has been a beacon of knowledge and excellence in Kerala. 
              Over the decades, we have nurtured generations of students, transforming them into professionals 
              who contribute to society. Nirmala College of Computer Science, a self-financing wing, launched the MCA program in 2002, 
              empowering students with the latest in technology and innovation.
            </p>
          </div>

          <div className="lg:w-1/2">
            <img 
              src={College}
              alt="Nirmala College" 
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900">Our Vision & Mission</h2>
            <div className="mt-6 space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-md">
                <h3 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
                  <FaUniversity /> Vision
                </h3>
                <p className="mt-2 text-gray-700 text-lg">
                  “Achieving academic excellence for technological advancement of the society.”
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-md">
                <h3 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
                  <FaUserTie /> Mission
                </h3>
                <p className="mt-2 text-gray-700 text-lg">
                  Our goal is to nurture well-rounded individuals with integrity, strong character, and professional excellence, 
                  ensuring quality education is accessible to all.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-6">
            <div className="text-center group">
                <img 
                src={AdminImage} 
                alt="Administrator" 
                className="w-full h-100 object-cover rounded-2xl shadow-md transform group-hover:scale-105 group-hover:shadow-2xl transition duration-300"
                />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition duration-300">
                Rev. Fr. Jose Pulloppillil
                </h3>
                <p className="text-gray-600 group-hover:text-gray-900 transition duration-300">Administrator</p>
            </div>

            <div className="text-center group">
                <img 
                src={ViceAdminImage} 
                alt="Asst. Administrator" 
                className="w-full h-100 object-cover rounded-2xl shadow-md transform group-hover:scale-105 group-hover:shadow-2xl transition duration-300"
                />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition duration-300">
                Rev. Fr. Paul Kalathoor
                </h3>
                <p className="text-gray-600 group-hover:text-gray-900 transition duration-300">Asst. Administrator</p>
            </div>
        </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
