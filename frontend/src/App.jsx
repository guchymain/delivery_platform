import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TrackDelivery from './pages/public/TrackDelivery';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateDelivery from './pages/customer/CreateDelivery';
import CustomerDeliveries from './pages/customer/CustomerDeliveries';
import DeliveryDetail from './pages/customer/DeliveryDetail';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerProfile from './pages/customer/CustomerProfile';

// Rider pages
import RiderDashboard from './pages/rider/RiderDashboard';
import AvailableJobs from './pages/rider/AvailableJobs';
import ActiveDelivery from './pages/rider/ActiveDelivery';
import RiderHistory from './pages/rider/RiderHistory';
import RiderProfile from './pages/rider/RiderProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDeliveries from './pages/admin/AdminDeliveries';
import AdminDispatch from './pages/admin/AdminDispatch';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRiders from './pages/admin/AdminRiders';
import AdminPayments from './pages/admin/AdminPayments';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/track" element={<TrackDelivery />} />

              {/* Customer Routes & Aliases */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/dashboard"
                element={<Navigate to="/customer" replace />}
              />
              <Route
                path="/customer/create-delivery"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CreateDelivery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/deliveries/new"
                element={<Navigate to="/customer/create-delivery" replace />}
              />
              <Route
                path="/customer/deliveries"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDeliveries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/deliveries/:id"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <DeliveryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/payments"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Rider Routes & Aliases */}
              <Route
                path="/rider"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/dashboard"
                element={<Navigate to="/rider" replace />}
              />
              <Route
                path="/rider/jobs"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <AvailableJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/available-jobs"
                element={<Navigate to="/rider/jobs" replace />}
              />
              <Route
                path="/rider/active"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <ActiveDelivery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/history"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <RiderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/profile"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <RiderProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes & Aliases */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={<Navigate to="/admin" replace />}
              />
              <Route
                path="/admin/deliveries"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDeliveries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dispatch"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDispatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/riders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminRiders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPayments />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#0f172a',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500'
              }
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
