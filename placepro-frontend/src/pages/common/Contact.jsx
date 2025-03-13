import React from 'react'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFax } from 'react-icons/fa';


const Contact = () => {
  return (
    <div>
      <section className="relative w-full bg-gradient-to-b from-gray-100 to-white py-24 pt-28 md:pt-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-gray-700 text-lg md:text-xl">We are here to assist you with any queries</p>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 flex flex-col space-y-8">
            <div className="flex items-center space-x-4">
              <FaPhoneAlt className="text-blue-600 text-3xl"/>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Contact Number</h2>
                <p className="text-gray-600">+91 8330836363, 8075577985</p>
                <p className="text-gray-600">9447305046</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaFax className="text-blue-600 text-3xl"/>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Fax</h2>
                <p className="text-gray-600">+91 485-2836300</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-blue-600 text-3xl"/>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Email Us</h2>
                <p className="text-gray-600">nirmalacollegemca@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-blue-600 text-3xl"/>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Address</h2>
                <p className="text-gray-600">Muvattupuzha P.O,</p>
                <p className="text-gray-600">Ernakulam District, Kerala, India</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
          <iframe width="100%" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=nirmala%20college,muvattupuzha+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.gps.ie/collections/drones/">buy drones</a></iframe>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Contact
