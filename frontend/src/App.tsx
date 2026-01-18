import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
// import Dashboard from './pages/Dashboard'; // Removed
import Login from './pages/Login';
import TableMap from './pages/TableMap';
import OrderCreation from './pages/OrderCreation';
import ProductionView from './pages/ProductionView';
import CashSession from './pages/cashier/CashSession';
import OrderPayment from './pages/cashier/OrderPayment';
import DailySales from './pages/cashier/DailySales';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import TableManagement from './pages/admin/TableManagement';
import WaiterOrderMonitor from './pages/waiter/WaiterOrderMonitor';
import OnlineUsersPage from './pages/admin/OnlineUsersPage';
import { OnlineUsersProvider } from './contexts/OnlineUsersContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Cargando...</div>;

  if (!profile) return <Navigate to="/login" />;

  switch (profile.rol) {
    case 'cocina': return <Navigate to="/cocina" />;
    case 'bar': return <Navigate to="/bar" />;
    default: return <Navigate to="/mesas" />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OnlineUsersProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<RoleBasedRedirect />} />
              <Route path="mesas" element={<TableMap />} />
              <Route path="mesas/pedidos" element={<WaiterOrderMonitor />} />
              <Route path="mesas/:tableId/nueva-orden" element={<OrderCreation />} />
              <Route path="cocina" element={<ProductionView area="cocina" />} />
              <Route path="bar" element={<ProductionView area="bar" />} />
              <Route path="caja" element={<CashSession />} />
              <Route path="caja/cobrar/:tableId" element={<OrderPayment />} />
              <Route path="ventas-diarias" element={<DailySales />} />
              <Route path="admin/reportes" element={<ReportsDashboard />} />
              <Route path="admin/productos" element={<ProductManagement />} />
              <Route path="admin/usuarios" element={<UserManagement />} />
              <Route path="admin/mesas" element={<TableManagement />} />
              <Route path="admin/online" element={<OnlineUsersPage />} />
            </Route>
          </Routes>
        </OnlineUsersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
