import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Send, History, Users, FileCheck, User,
  TrendingUp, LogOut, Menu, X, Bell, ChevronDown, Globe
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-money', icon: Send, label: 'Send Money' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/beneficiaries', icon: Users, label: 'Beneficiaries' },
  { to: '/rates', icon: TrendingUp, label: 'Exchange Rates' },
  { to: '/kyc', icon: FileCheck, label: 'KYC Verification' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const KYCBadge = () => {
    const colors = { pending: 'bg-yellow-100 text-yellow-700', submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[user?.kycStatus] || ''}`}>{user?.kycStatus?.toUpperCase()}</span>;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-primary-800" style={{ fontFamily: 'DM Sans' }}>TransFast</span>
            <p className="text-xs text-gray-400">Money Transfer</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
              <KYCBadge />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-800">{user?.firstName}</span>!</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
