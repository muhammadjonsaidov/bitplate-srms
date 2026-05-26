import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import Layout from './components/layout/Layout'
import TablesPage from './pages/TablesPage'
import OrdersPage from './pages/OrdersPage'
import KitchenPage from './pages/KitchenPage'
import BillingPage from './pages/BillingPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  const { isAuthenticated } = useAuthStore()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/tables" replace />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kitchen" element={<KitchenPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
