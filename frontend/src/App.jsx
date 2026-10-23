import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// User Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { MyBookingsPage } from './pages/student/MyBookingsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { MyEventRequestsPage } from './pages/student/MyEventRequestsPage';
import { SubmitEventRequestPage } from './pages/student/SubmitEventRequestPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminEventRequestsPage } from './pages/admin/AdminEventRequestsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
  </div>
);

const RequireAuth = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  if (authLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
};

export const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route
          path="/login"
          element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>}
        />
        <Route
          path="/register"
          element={<RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>}
        />

        {/* User/Organizer Routes (Protected) */}
        <Route
          path="/"
          element={<RequireAuth><StudentLayout /></RequireAuth>}
        >
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="my-requests" element={<MyEventRequestsPage />} />
          <Route path="request-event" element={<SubmitEventRequestPage />} />
          {/* Legacy student routes */}
          <Route path="student/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="student/bookings" element={<Navigate to="/my-bookings" replace />} />
          <Route path="student/profile" element={<Navigate to="/profile" replace />} />
        </Route>

        {/* Admin Routes (Protected) */}
        <Route
          path="/admin"
          element={<RequireAuth adminOnly><AdminLayout /></RequireAuth>}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="event-requests" element={<AdminEventRequestsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
