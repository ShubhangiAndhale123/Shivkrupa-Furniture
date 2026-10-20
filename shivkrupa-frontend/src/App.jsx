import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Public Pages
import LandingPage from './pages/public/LandingPage'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import NewRequirement from './pages/customer/NewRequirement'
import BudgetDesign from './pages/customer/BudgetDesign'
import DesignDetails from './pages/customer/DesignDetails'
import ReferenceDesign from './pages/customer/ReferenceDesign'
import CostEstimation from './pages/customer/CostEstimation'
import BudgetOptimize from './pages/customer/BudgetOptimize'
import DesignCompare from './pages/customer/DesignCompare'
import MyDesigns from './pages/customer/MyDesigns'
import CustomerQuotations from './pages/customer/CustomerQuotations'
import CustomerOrders from './pages/customer/CustomerOrders'
import CustomerProfile from './pages/customer/CustomerProfile'

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffRequirements from './pages/staff/StaffRequirements'
import StaffDesigns from './pages/staff/StaffDesigns'
import StaffEstimations from './pages/staff/StaffEstimations'
import StaffQuotations from './pages/staff/StaffQuotations'
import StaffOrders from './pages/staff/StaffOrders'
import StaffCustomers from './pages/staff/StaffCustomers'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminMaterials from './pages/admin/AdminMaterials'
import AdminHardware from './pages/admin/AdminHardware'
import AdminDesigns from './pages/admin/AdminDesigns'
import AdminPricing from './pages/admin/AdminPricing'
import AdminQuotations from './pages/admin/AdminQuotations'
import AdminOrders from './pages/admin/AdminOrders'
import AdminEmployees from './pages/admin/AdminEmployees'
import AdminReports from './pages/admin/AdminReports'

// Production Pages
import ProductionDashboard from './pages/production/ProductionDashboard'
import ProductionOrders from './pages/production/ProductionOrders'
import ProductionProfile from './pages/production/ProductionProfile'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import StaffLayout from './components/layout/StaffLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProductionLayout from './components/layout/ProductionLayout'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Direct Role URL Aliases */}
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/production" element={<Navigate to="/production/dashboard" replace />} />

          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/requirements/new" element={<NewRequirement />} />
              <Route path="/customer/design/budget" element={<BudgetDesign />} />
              <Route path="/customer/design/:id" element={<DesignDetails />} />
              <Route path="/customer/design/reference" element={<ReferenceDesign />} />
              <Route path="/customer/estimation" element={<CostEstimation />} />
              <Route path="/customer/design/optimize" element={<BudgetOptimize />} />
              <Route path="/customer/design/compare" element={<DesignCompare />} />
              <Route path="/customer/designs" element={<MyDesigns />} />
              <Route path="/customer/quotations" element={<CustomerQuotations />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
            <Route element={<StaffLayout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/requirements" element={<StaffRequirements />} />
              <Route path="/staff/designs" element={<StaffDesigns />} />
              <Route path="/staff/estimations" element={<StaffEstimations />} />
              <Route path="/staff/quotations" element={<StaffQuotations />} />
              <Route path="/staff/orders" element={<StaffOrders />} />
              <Route path="/staff/customers" element={<StaffCustomers />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/materials" element={<AdminMaterials />} />
              <Route path="/admin/hardware" element={<AdminHardware />} />
              <Route path="/admin/designs" element={<AdminDesigns />} />
              <Route path="/admin/pricing" element={<AdminPricing />} />
              <Route path="/admin/quotations" element={<AdminQuotations />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/employees" element={<AdminEmployees />} />
              <Route path="/admin/users" element={<AdminEmployees />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Production Routes */}
          <Route element={<ProtectedRoute allowedRoles={['production', 'admin']} />}>
            <Route element={<ProductionLayout />}>
              <Route path="/production/dashboard" element={<ProductionDashboard />} />
              <Route path="/production/orders" element={<ProductionOrders />} />
              <Route path="/production/profile" element={<ProductionProfile />} />
            </Route>
          </Route>

          {/* Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
