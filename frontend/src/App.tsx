import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LiquidBackground } from "./components/layout/LiquidBackground";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import UserLayout from "./components/user/UserLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy Loaded Pages to reduce Main Bundle TTFB and Parse Time
const Index = React.lazy(() => import("./pages/Index"));
const Issues = React.lazy(() => import("./pages/Issues"));
const Submit = React.lazy(() => import("./pages/Submit"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));

const IssueDetails = React.lazy(() => import("./pages/IssueDetails"));

const AdminLogin = React.lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AddIssue = React.lazy(() => import("./pages/admin/AddIssue"));
const ManageIssues = React.lazy(() => import("./pages/admin/ManageIssues"));
const VoteMonitor = React.lazy(() => import("./pages/admin/VoteMonitor"));
const PendingIssues = React.lazy(() => import("./pages/admin/PendingIssues"));
const EmergencyControl = React.lazy(() => import("./pages/admin/EmergencyControl"));
const UserManagement = React.lazy(() => import("./pages/admin/UserManagement"));
const StaffManagement = React.lazy(() => import("./pages/admin/StaffManagement"));
const CommunicationCenter = React.lazy(() => import("./pages/admin/CommunicationCenter"));
const BulkEmail = React.lazy(() => import("./pages/admin/BulkEmail"));
const ComingSoon = React.lazy(() => import("./pages/admin/ComingSoon"));
const AuditLogs = React.lazy(() => import("./pages/admin/AuditLogs"));
const SystemConfig = React.lazy(() => import("./pages/admin/SystemConfig"));
const ReportsAnalytics = React.lazy(() => import("./pages/admin/ReportsAnalytics"));
const KnowledgeBase = React.lazy(() => import("./pages/admin/KnowledgeBase"));
const EmailSettings = React.lazy(() => import("./pages/admin/EmailSettings"));

const UserRegister = React.lazy(() => import("./pages/user/UserRegister"));
const UserLogin = React.lazy(() => import("./pages/user/UserLogin"));
const UserDashboard = React.lazy(() => import("./pages/user/UserDashboard"));
const UserSubmitIssue = React.lazy(() => import("./pages/user/UserSubmitIssue"));
const UserMyIssues = React.lazy(() => import("./pages/user/UserMyIssues"));
const UserProfile = React.lazy(() => import("./pages/user/UserProfile"));
const UserSettings = React.lazy(() => import("./pages/user/UserSettings"));
const ForgotPassword = React.lazy(() => import("./pages/user/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/user/ResetPassword"));

const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Suspense Fallback Loader - Replaced with a subtle non-blocking state to prevent layout jumps
const FallbackLoader = () => (
  <div className="flex bg-transparent items-center justify-center min-h-[50vh]">
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <LiquidBackground>
            <Suspense fallback={<FallbackLoader />}>
              <Routes>

                {/* PUBLIC ROUTES */}
                <Route
                  path="/"
                  element={
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
                      <Navbar />
                      <main className="flex-1"><Index /></main>
                      <Footer />
                    </div>
                  }
                />

                <Route
                  path="/issues"
                  element={
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
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
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
                      <Navbar />
                      <main className="flex-1"><IssueDetails /></main>
                      <Footer />
                    </div>
                  }
                />

                <Route
                  path="/submit"
                  element={
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
                      <Navbar />
                      <main className="flex-1"><Submit /></main>
                      <Footer />
                    </div>
                  }
                />

                <Route
                  path="/about"
                  element={
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
                      <Navbar />
                      <main className="flex-1"><About /></main>
                      <Footer />
                    </div>
                  }
                />

                <Route
                  path="/contact"
                  element={
                    <div className="flex flex-col min-h-full h-full overflow-y-auto pt-20">
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
                  <Route path="email-settings" element={<EmailSettings />} />

                </Route>

                {/* 404 PAGE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </LiquidBackground>
        </BrowserRouter>

      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
