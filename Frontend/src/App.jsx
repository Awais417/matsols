import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import UniversityAdmissions from "./pages/UniversityAdmissions";
import CourseMatching from "./pages/CourseMatching";
import VisaSupport from "./pages/VisaSupport";
import InstitutionalRepresentation from "./pages/InstitutionalRepresentation";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
// import Register from "./pages/Register";
// import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
// import DashboardHome from "./pages/Dashboard/DashboardHome";
// import MyApplications from "./pages/Dashboard/MyApplications";
// import StudentUniversitySearch from "./pages/Dashboard/StudentUniversitySearch";
// import StudentUniversityDetail from "./pages/Dashboard/StudentUniversityDetail";
// import Documents from "./pages/Dashboard/Documents";
// import Messages from "./pages/Dashboard/Messages";
// import Settings from "./pages/Dashboard/Settings";
import AdminOverview from "./pages/Admin/AdminOverview";
import LeadManagement from "./pages/Admin/LeadManagement";
import UniversityManagement from "./pages/Admin/UniversityManagement";
import UpdatesManagement from "./pages/Admin/UpdatesManagement";
import DegreeManagement from "./pages/Admin/DegreeManagement";
import ScholarshipManagement from "./pages/Admin/ScholarshipManagement";
import SystemSettings from "./pages/Admin/SystemSettings";
import UserManagement from "./pages/Admin/UserManagement";
import SecuritySettings from "./pages/Admin/SecuritySettings";
import ActivityLog from "./pages/Admin/ActivityLog";
import FreeConsultation from "./pages/FreeConsultation";
import UniversitySearch from "./pages/UniversitySearch";
import UniversityDetail from "./pages/UniversityDetail";
import DegreeListing from "./pages/DegreeListing";
import DegreeDetail from "./pages/DegreeDetail";
import Scholarships from "./pages/Scholarships";
import Events from "./pages/Events";
import ScrollToTop from "./components/ScrollToTop";
import GlobalConsultationWidget from "./components/GlobalConsultationWidget";
// import AIChat from "./components/AIChat";
import { AuthProvider } from "./context/AuthContext";
import { PublicSettingsProvider } from "./context/PublicSettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <ScrollToTop />
      <Routes location={backgroundLocation || location}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/what-we-offer" element={<Services />} />
      <Route path="/what-we-offer/university-admissions" element={<UniversityAdmissions />} />
      <Route path="/what-we-offer/course-matching" element={<CourseMatching />} />
      <Route path="/what-we-offer/visa-support" element={<VisaSupport />} />
      <Route path="/what-we-offer/institutional-representation" element={<InstitutionalRepresentation />} />
      <Route path="/universities" element={<UniversitySearch />} />
      <Route path="/universities/:id" element={<UniversityDetail />} />
      <Route path="/faqs" element={<FAQ />} />
      <Route path="/degrees" element={<DegreeListing />} />
      <Route path="/degrees/:slug" element={<DegreeDetail />} />
      <Route path="/scholarships" element={<Scholarships />} />
      <Route path="/events" element={<Events />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/free-consultation" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/free-consultation" replace />} />

      <Route path="/admin" element={
        <ProtectedRoute requiredRole={["ADMIN", "EDITOR", "MARKETING", "VIEWER", "SUPPORT_AGENT", "COUNSELOR"]}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="leads" element={
          <ProtectedRoute requiredRole={["ADMIN", "MARKETING", "COUNSELOR"]}>
            <LeadManagement />
          </ProtectedRoute>
        } />
        <Route path="chat-queue" element={
          <ProtectedRoute requiredRole={["ADMIN", "EDITOR", "MARKETING", "SUPPORT_AGENT", "COUNSELOR"]}>
            <LeadManagement />
          </ProtectedRoute>
        } />
        <Route path="updates" element={
          <ProtectedRoute requiredRole={["ADMIN", "EDITOR"]}>
            <UpdatesManagement />
          </ProtectedRoute>
        } />
        <Route path="universities" element={
          <ProtectedRoute requiredRole={["ADMIN", "EDITOR"]}>
            <UniversityManagement />
          </ProtectedRoute>
        } />
        <Route path="degrees" element={
          <ProtectedRoute requiredRole={["ADMIN", "EDITOR"]}>
            <DegreeManagement />
          </ProtectedRoute>
        } />
        <Route path="scholarships" element={
          <ProtectedRoute requiredRole={["ADMIN", "EDITOR"]}>
            <ScholarshipManagement />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <SystemSettings />
          </ProtectedRoute>
        } />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="activity" element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <ActivityLog />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <UserManagement />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="/free-consultation" element={<FreeConsultation />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/free-consultation"
            element={<FreeConsultation embedded />}
          />
        </Routes>
      )}

      <GlobalConsultationWidget />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <PublicSettingsProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PublicSettingsProvider>
    </AuthProvider>
  );
}

export default App;
