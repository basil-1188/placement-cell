import React from "react";
import { FaGraduationCap, FaRobot, FaFileAlt, FaChartBar, FaEdit } from "react-icons/fa";

const Services = () => {
  return (
    <div className="bg-white mt-4 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Place-Pro empowers students, placement officers, and training teams with innovative tools and resources.
          </p>
        </header>

        {/* Services Section */}
        <section className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Service 1: Comprehensive Training */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <FaGraduationCap className="text-indigo-600 text-5xl mb-6 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Comprehensive Training
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Access free live webinars, recorded lectures, and interactive sessions to build essential skills for career success.
            </p>
          </div>

          {/* Service 2: AI-Powered Evaluations */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <FaRobot className="text-indigo-600 text-5xl mb-6 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              AI-Powered Evaluations
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Benefit from automated interview assessments and resume reviews with personalized, actionable feedback.
            </p>
          </div>

          {/* Service 3: Job Opportunity Management */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <FaFileAlt className="text-indigo-600 text-5xl mb-6 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Job Opportunity Management
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Gain clear visibility into job openings with eligibility details and a streamlined application process.
            </p>
          </div>

          {/* Service 4: Performance Analytics */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <FaChartBar className="text-indigo-600 text-5xl mb-6 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Performance Analytics
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Leverage detailed reports and analytics to track performance and optimize placement strategies.
            </p>
          </div>

          {/* Service 5: Resume Enhancement */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <FaEdit className="text-indigo-600 text-5xl mb-6 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Resume Enhancement
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Receive tailored feedback through AI-driven and manual resume reviews to meet industry standards.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Elevate Your Placement Journey
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Explore Place-Pro’s services and unlock a smarter, more efficient path to career success.
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 text-lg font-semibold"
          >
            Get Started
          </a>
        </section>
      </div>
    </div>
  );
};

export default Services;