import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import UserLayout from "./components/user/UserLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Issues from "./pages/Issues";
import Submit from "./pages/Submit";
import About from "./pages/About";
import Contact from "./pages/Contact";

import IssueDetails from "./pages/IssueDetails";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AddIssue from "./pages/admin/AddIssue";
import ManageIssues from "./pages/admin/ManageIssues";
import VoteMonitor from "./pages/admin/VoteMonitor";
import PendingIssues from "./pages/admin/PendingIssues";
import EmergencyControl from "./pages/admin/EmergencyControl";
import UserManagement from "./pages/admin/UserManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import CommunicationCenter from "./pages/admin/CommunicationCenter";
import BulkEmail from "./pages/admin/BulkEmail";
import ComingSoon from "./pages/admin/ComingSoon";
import AuditLogs from "./pages/admin/AuditLogs";
import SystemConfig from "./pages/admin/SystemConfig";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import KnowledgeBase from "./pages/admin/KnowledgeBase";

import UserRegister from "./pages/user/UserRegister";
import UserLogin from "./pages/user/UserLogin";
import UserDashboard from "./pages/user/UserDashboard";
import UserSubmitIssue from "./pages/user/UserSubmitIssue";
import UserMyIssues from "./pages/user/UserMyIssues";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route
              path="/"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><Index /></main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/issues"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><Issues /></main>
                  <Footer />
                </div>
              }
            />

            {/* ISSUE DETAILS */}
            <Route
              path="/issues/:id"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><IssueDetails /></main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/submit"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><Submit /></main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/about"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><About /></main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/contact"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><Contact /></main>
                  <Footer />
                </div>
              }
            />

            {/* USER AUTHENTICATION */}
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* PROTECTED USER ROUTES */}
            <Route
              path="/user"
              element={
                <UserProtectedRoute>
                  <UserLayout />
                </UserProtectedRoute>
              }
            >
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="submit" element={<UserSubmitIssue />} />
              <Route path="my-issues" element={<UserMyIssues />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* ADMIN LOGIN */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* PROTECTED ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </ProtectedRoute>
              }
            >

              {/* CHILD ROUTES — ✔ NO LEADING SLASH */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-issue" element={<AddIssue />} />
              <Route path="manage-issues" element={<ManageIssues />} />
              <Route path="vote-monitor" element={<VoteMonitor />} />
              <Route path="pending" element={<PendingIssues />} />
              <Route path="emergency" element={<EmergencyControl />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="communications" element={<CommunicationCenter />} />
              <Route path="bulk-email" element={<BulkEmail />} />

              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="config" element={<SystemConfig />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="kb" element={<KnowledgeBase />} />

            </Route>

            {/* 404 PAGE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
