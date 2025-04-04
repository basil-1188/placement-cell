import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AppContextProvider, AppContext } from "./context/AppContext";
import Home from "./pages/common/Home";
import Blogs from "./pages/common/Blogs";
import Profile from "./pages/user/Profile";
import Results from "./pages/user/Results";
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
import UpdateRoles from "./pages/admin/UpdateRoles";
import AllStudents from "./pages/admin/AllStudents";
import OfficerLayout from "./Layouts/OfficerLayout";
import TeamLayout from "./Layouts/TeamLayout";
import OfficerProfile from "./pages/placement_officer/OfficerProfile";
import TeamProfile from "./pages/trainingteam/TeamProfile";
import CreateTest from "./pages/placement_officer/CreateTest";
import TakeTest from "./pages/user/TakeTest";
import TakeTestList from "./pages/user/TakeTestList";
import StudentLists from "./pages/placement_officer/StudentLists";
import ViewAllTest from "./pages/placement_officer/ViewAllTest";
import MockTestAttendees from "./pages/placement_officer/MockTestAttendees";
import MockTestResults from "./pages/placement_officer/MockTestResults";
import TestHistory from "./pages/user/TestHistory";
import Leaderboard from "./pages/user/LeaderBoard";
import JobPostingForm from "./pages/placement_officer/JobPostingForm";
import StudentJobsList from "./pages/user/StudentJobsList";
import CampusDriveStudents from "./pages/placement_officer/CampusDriveStudentsList";
import CampusDriveList from "./pages/placement_officer/CampusDriveList";
import OfficerBlogDashboard from "./pages/placement_officer/OfficerBlogDashboard";
import StudentBlogList from "./pages/user/StudentBlogList";
import BlogDetail from "./pages/user/BlogDetail";
import TeamBlogDashboard from "./pages/trainingteam/TeamBlogDashboard";
import Services from "./pages/common/Services";
import Materials from "./pages/trainingteam/Materials"
import MaterialsUser from "./pages/user/MaterialsUser";
import VideosTeam from "./pages/trainingteam/VideosTeam";
import UserVideos from "./pages/user/UserVideos";
import TeamQA from "./pages/trainingteam/TeamQA";
import StudentQA from "./pages/user/StudentQA";
import TeamStudentLists from "./pages/trainingteam/TeamStudentLists";
import MockTestMarks from "./pages/trainingteam/MockTestMarks";
import LiveClass from "./pages/trainingteam/LiveClass";
import StudentLiveClass from "./pages/user/StudentLiveClass";
import ResumeReview from "./pages/trainingteam/ResumeReview";
import StudentFeedback from "./pages/user/StudentFeedback";
import ATSChecker from "./pages/user/ATSChecker";
import OfficerTrainingTeam from "./pages/admin/OfficerTrainingTeam";
import MockTests from "./pages/admin/MockTests";
import TrainingResources from "./pages/admin/TrainingResources";
import JobManagement from "./pages/admin/JobManagement";
import CampusDriveApplicants from "./pages/admin/CampusDriveApplicants";
import BlogsManagement from "./pages/admin/BlogsManagement";
import BlogView from "./pages/admin/BlogView";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import AdminTools from "./pages/admin/AdminTools";

const ProtectedRoute = ({ children, allowedRoles, isPublic = false }) => {
  const { isLogin, userData, loading } = useContext(AppContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f5f7ff]">Loading...</div>;
  }

  if (!isLogin && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to={userData?.role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
};

const App = () => {
  return (
    <AppContextProvider>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <NavbarSelector />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute isPublic={true}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/contact_us" element={<Contact />} />
            <Route path="/about_us" element={<AboutUs />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/register" element={<AuthForm />} />
            <Route path="/services" element={<Services />} />
            <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="upload-details" element={<StudentDetailsForm />} />
              <Route path="jobs" element={<StudentJobsList />} />
              <Route path="blogs" element={<StudentBlogList />} />
              <Route path="blogs/:blogId" element={<BlogDetail />} />
              <Route path="study-resources" element={<MaterialsUser />} />
              <Route path="videos" element={<UserVideos />} />
              <Route path="qa" element={<StudentQA />} />
              <Route path="live-classes" element={<StudentLiveClass />} />
              <Route path="resume/manual-feedbacks" element={<StudentFeedback />} />
              <Route path="resume/ats-checker" element={<ATSChecker />} />
              <Route path="mock-tests">
                <Route path="take-test" element={<TakeTestList />} />
                <Route path="take-test/:id" element={<TakeTest />} />
                <Route path="test-history" element={<TestHistory />} />
                <Route path="ranks" element={<Leaderboard />} />
              </Route>
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="manage-users/update-roles" element={<UpdateRoles />} />
              <Route path="manage-users/all-studentdetails" element={<AllStudents />} />
              <Route path="manage-users/officer-team" element={<OfficerTrainingTeam />} />
              <Route path="mock-tests" element={<MockTests />} />
              <Route path="training-resources" element={<TrainingResources />} />
              <Route path="job-management" element={<JobManagement />} />
              <Route path="/admin/campus-drive-applicants/:jobId" element={<CampusDriveApplicants />} />
              <Route path="blogs" element={<BlogsManagement />}  />
              <Route path="/admin/blog/:blogId" element={<BlogView />} />
              <Route path="reports" element={<Reports />}  />
              <Route path="notifications" element={<Notifications />}  />
              <Route path="admin-tools" element={<AdminTools />}  />

            </Route>
            <Route
              path="/officer"
              element={
                <ProtectedRoute allowedRoles={["placement_officer"]}>
                  <OfficerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="profile" element={<OfficerProfile />} />
              <Route path="create-test" element={<CreateTest />} />
              <Route path="student-details" element={<StudentLists />} />
              <Route path="view-all-test" element={<ViewAllTest />} />
              <Route path="job-postings" element={<JobPostingForm />}  />
              <Route path="blogs" element={<OfficerBlogDashboard />} />
              <Route path="mock-test-attendees" element={<MockTestAttendees />} />
              <Route path="mock-test-results" element={<MockTestResults />} />
              <Route path ='campus-drives' element={<CampusDriveList />} />
              <Route path="campus-drive-students/:jobId" element={<CampusDriveStudents />}  />
            </Route>
            <Route
              path="/team"
              element={
                <ProtectedRoute allowedRoles={["training_team"]}>
                  <TeamLayout />
                </ProtectedRoute>
              }
            >
              <Route path="profile" element={<TeamProfile />} />
              <Route path="blogs" element={<TeamBlogDashboard />} />
              <Route path="resources" element={<Materials />} />
              <Route path="videos" element={<VideosTeam />} />
              <Route path="Q-A" element={<TeamQA />} />
              <Route path="student-lists" element={<TeamStudentLists />} />
              <Route path="mocktest-results" element={<MockTestMarks />} />
              <Route path="live-class" element={<LiveClass />} />
              <Route path="resume-review" element={<ResumeReview/>} />

            </Route>
          </Routes>
        </main>
        <FooterSelector />
      </div>
    </AppContextProvider>
  );
};

const NavbarSelector = () => {
  const { userData, isTestActive } = useContext(AppContext);
  console.log("NavbarSelector - userData:", userData, "isTestActive:", isTestActive);

  if (isTestActive) return null;

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
  const { userData, isTestActive } = useContext(AppContext);
  console.log("FooterSelector - userData:", userData, "isTestActive:", isTestActive);

  if (isTestActive) return null;

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