import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import HomeImage1 from '../../assets/home.jpg';
import HomeImage2 from '../../assets/home-1.jpg';
import HomeImage3 from '../../assets/home-2.jpg';

import CompanyImage from '../../assets/company.png'
import CompanyImage2 from '../../assets/company-2.jpg'
import CompanyImage3 from '../../assets/company-3.png'
import CompanyImage4 from '../../assets/company-4.png'
import CompanyImage5 from '../../assets/company-5.png'
import CompanyImage6 from '../../assets/company-6.png'



const Home = () => {
  return (
    <section className="relative w-full bg-gradient-to-b from-blue-50 to-gray-100 py-24 pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Empower Your Future with  
              <span className="text-blue-600"> Nirmala MCA Placement</span>
            </h1>
            <p className="mt-4 text-gray-700 text-lg md:text-xl leading-relaxed">
              Gain access to exclusive job opportunities, expert-led training, and AI-powered resume assistance.  
              Start your journey towards a successful career today.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start space-x-4">
              <Link 
                to="/contact_us" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition font-semibold"
              >
                Get in Touch
              </Link>
              <Link 
                to="/about_us" 
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:text-white transition font-semibold"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 text-gray-900">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-blue-600">95%</h2>
                <p className="text-lg font-medium">Placement Rate</p>
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-bold text-blue-600">20+</h2>
                <p className="text-lg font-medium">Hiring Companies</p>
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-bold text-blue-600">200+</h2>
                <p className="text-lg font-medium">Successful Students</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="w-full max-w-lg rounded-2xl shadow-xl"
            >
              <SwiperSlide>
                <img 
                  src={HomeImage1} 
                  alt="Placement Success" 
                  className="w-full h-96 object-cover rounded-2xl shadow-md"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img 
                  src={HomeImage2} 
                  alt="Career Growth" 
                  className="w-full h-96 object-cover rounded-2xl shadow-md"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img 
                  src={HomeImage3} 
                  alt="Job Opportunities" 
                  className="w-full h-96 object-cover rounded-2xl shadow-md"
                />
              </SwiperSlide>
            </Swiper>
          </div>

        </div>
      </div>

      <div className="mt-20 bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Hiring Partners</h2>
          <p className="text-gray-600 mt-2">Leading companies that have recruited our students</p>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
          <img src={CompanyImage} alt="Company 1" className="h-25"/>
            <img src={CompanyImage2} alt="Company 2" className="h-20"/>
            <img src={CompanyImage3} alt="Company 3" className="h-30"/>
            <img src={CompanyImage4} alt="Company 4" className="h-30"/>
            <img src={CompanyImage5} alt="Company 4" className="h-30"/>
            <img src={CompanyImage6} alt="Company 4" className="h-30"/>

          </div>
        </div>
      </div>

    </section>
  );
};

export default Home;
