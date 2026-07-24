import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import CustomerRoute from './components/common/CustomerRoute';
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import AssessmentRequest from './pages/customer/AssessmentRequest';
import CustomerVulnerabilities from './pages/customer/Vulnerabilities';
import CustomerReports from './pages/customer/Reports';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAssessments from './pages/admin/Assessments';
import AdminCustomers from './pages/admin/Customers';
import AdminVulnerabilities from './pages/admin/Vulnerabilities';
import AdminReports from './pages/admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/assessments/new"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <AssessmentRequest />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/vulnerabilities"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <CustomerVulnerabilities />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/reports"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <CustomerReports />
                </CustomerLayout>
              </CustomerRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/assessments"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminAssessments />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCustomers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vulnerabilities"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminVulnerabilities />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
