import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User pages
import UserLayout from './components/layout/UserLayout';
import DashboardPage from './pages/user/DashboardPage';
import SendMoneyPage from './pages/user/SendMoneyPage';
import TransactionsPage from './pages/user/TransactionsPage';
import TransactionDetailPage from './pages/user/TransactionDetailPage';
import BeneficiariesPage from './pages/user/BeneficiariesPage';
import KYCPage from './pages/user/KYCPage';
import ProfilePage from './pages/user/ProfilePage';
import RatesPage from './pages/user/RatesPage';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminKYC from './pages/admin/AdminKYC';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !['admin', 'compliance', 'support'].includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={['admin', 'compliance', 'support'].includes(user.role) ? '/admin' : '/dashboard'} />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User */}
          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="send-money" element={<SendMoneyPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:id" element={<TransactionDetailPage />} />
            <Route path="beneficiaries" element={<BeneficiariesPage />} />
            <Route path="kyc" element={<KYCPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="rates" element={<RatesPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
