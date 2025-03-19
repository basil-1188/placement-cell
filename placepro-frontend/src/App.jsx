import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import Home from "./pages/common/Home";
import Blogs from "./pages/common/Blogs";
import Profile from "./pages/user/Profile";
import Results from "./pages/user/Results";
import MockTest from "./pages/user/MockTest";
import UserDashboard from "./pages/user/UserDashboard";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./Layouts/AdminLayout";
import UserLayout from "./Layouts/UserLayout";
import Footers from "./components/common/Footers";
import Navbar from "./components/common/Navbar";
import StudentNavbar from "./components/navbars/StudentNavbar";
import OfficerNavbar from "./components/navbars/OfficerNavbar";
import TeamNavbar from "./components/navbars/TeamNavbar";
import Contact from "./pages/common/Contact";
import AboutUs from "./pages/common/AboutUs";
import AuthForm from "./pages/auth/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentDetailsForm from "./pages/user/StudentDetailsForm";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";

const App = () => {
  return (
    <AppContextProvider>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        {/* Header - Role Based */}
        <NavbarSelector />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/contact_us" element={<Contact />} />
            <Route path="/about_us" element={<AboutUs />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/register" element={<AuthForm />} />
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="upload-details" element={<StudentDetailsForm />} />
              <Route path="results" element={<Results />} />
              <Route path="mock-test" element={<MockTest />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
          </Routes>
        </main>

        {/* Footer - Common for all */}
        <Footers />
      </div>
    </AppContextProvider>
  );
};

const NavbarSelector = () => {
  const { userData } = useContext(AppContext);
  console.log("NavbarSelector - userData:", userData);

  if (!userData) {
    return <Navbar />;
  }

  switch (userData.role) {
    case "student":
      return <StudentNavbar />;
    case "placement_officer":
      return <OfficerNavbar />;
    case "training_team":
      return <TeamNavbar />;
    case "admin":
      return null; // Admin pages may have their own header inside AdminLayout
    default:
      return <Navbar />;
  }
};

export default App;
