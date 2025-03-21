import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider, AppContext } from "./context/AppContext";
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
import UpdateRoles from "./pages/admin/UpdateRoles";
import AllStudents from "./pages/admin/AllStudents";
import OfficerLayout from "./Layouts/OfficerLayout";
import TeamLayout from "./Layouts/TeamLayout";
import OfficerProfile from "./pages/placement_officer/OfficerProfile";
import TeamProfile from "./pages/trainingteam/TeamProfile";

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
              <Route path="manage-users/update-roles" element={<UpdateRoles />} />
              <Route path="manage-users/all-studentdetails" element={<AllStudents />} />
            </Route>
            <Route path="/officer" element={<OfficerLayout />}>
              <Route path="profile" element={<OfficerProfile />} />
            </Route>
            <Route path="/team" element={<TeamLayout />}>
              <Route path="profile" element={<TeamProfile />} />
            </Route>
          </Routes>
        </main>

        <FooterSelector />
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
      return null; 
    default:
      return <Navbar />;
  }
};

const FooterSelector = () => {
  const { userData } = useContext(AppContext);
  console.log("FooterSelector - userData:", userData);

  if (!userData) {
    return <Footers />; 
  }

  switch (userData.role) {
    case "student":
    case "placement_officer":
    case "training_team":
      return <Footers />; 
    case "admin":
      return null; 
    default:
      return <Footers />; 
  }
};

export default App;