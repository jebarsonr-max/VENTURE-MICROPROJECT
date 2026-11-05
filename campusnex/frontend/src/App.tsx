import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MarketplacePage } from './pages/MarketplacePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { IoTMonitoringPage } from './pages/IoTMonitoringPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { VendorInventoryPage } from './pages/VendorInventoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { FleetManagementPage } from './pages/FleetManagementPage';
import { LogisticsEnginePage } from './pages/LogisticsEnginePage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-campus-muted">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-campus-bg text-campus-text font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/tracking" element={<LiveTrackingPage />} />
                <Route path="/iot" element={<IoTMonitoringPage />} />
                <Route path="/logistics" element={<LogisticsEnginePage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Protected Routes */}
                <Route
                  path="/vendor"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorInventoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/fleet" element={<FleetManagementPage />} />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

