import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import TablesPage from './pages/TablesPage'
import ReservationsPage from './pages/ReservationsPage'
import OrdersPage from './pages/OrdersPage'
import KitchenPage from './pages/KitchenPage'
import BillingPage from './pages/BillingPage'
import MenuAdminPage from './pages/MenuAdminPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected — wrapped in layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/tables" replace />} />
          <Route path="tables"       element={<TablesPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="orders"       element={<OrdersPage />} />
          <Route path="kitchen"      element={<KitchenPage />} />
          <Route path="billing"      element={<BillingPage />} />
          <Route path="menu-admin"   element={<MenuAdminPage />} />
          <Route path="dashboard"    element={<DashboardPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
