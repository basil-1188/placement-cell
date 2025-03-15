import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/common/Home'
import Blogs from './pages/common/Blogs'
import Profile from './pages/user/Profile'
import Results from './pages/user/Results'
import MockTest from './pages/user/MockTest'
import Reports from './pages/admin/Reports'
import RoboticInterview from './pages/admin/RoboticInterview'
import UserDashboard from './pages/user/UserDashboard'
import Dashboard from './pages/admin/Dashboard'
import AdminLayout from './Layouts/AdminLayout'
import UserLayout from './Layouts/UserLayout'
import Footers from './components/common/Footers'
import Navbar from './components/common/Navbar'
import Contact from './pages/common/Contact'
import AboutUs from './pages/common/AboutUs'
import Login from './pages/auth/Login'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/blogs' element={<Blogs />} />
        <Route path='/contact_us' element={<Contact />} />
        <Route path='/about_us' element={<AboutUs />} />
        <Route path='/login' element={<Login />} />

        <Route path='/user' element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path='profile' element={<Profile />} />
          <Route path='results' element={<Results />} />
          <Route path='mock-test' element={<MockTest />} />
        </Route>

        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='reports' element={<Reports />} />
          <Route path='robotic-interview' element={<RoboticInterview />} />
        </Route>
      </Routes>
      <Footers />
    </div>
  )
}

export default App
