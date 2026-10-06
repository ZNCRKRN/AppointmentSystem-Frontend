import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import NewAppointmentButton from './components/NewAppointmentButton';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyAppointments from './pages/MyAppointments';
import Availability from './pages/Availability';
import AdminUsers from './pages/AdminUsers';
import AppointmentForm from './components/AppointmentForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="relative">
                        <Dashboard />
                        <NewAppointmentButton onClick={() => setShowAppointmentForm(true)} />
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute roles={['Advisor', 'Student']}>
                    <Layout>
                      <div className="relative">
                        <MyAppointments />
                        <NewAppointmentButton onClick={() => setShowAppointmentForm(true)} />
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/availability"
                element={
                  <ProtectedRoute roles={['Advisor']}>
                    <Layout>
                      <Availability />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <Layout>
                      <AdminUsers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {showAppointmentForm && (
              <AppointmentForm
                onClose={() => setShowAppointmentForm(false)}
                onSuccess={() => setShowAppointmentForm(false)}
              />
            )}
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
