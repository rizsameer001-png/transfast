import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, ArrowLeftRight, FileCheck, ScrollText, LogOut, Globe, Shield, Menu, X, Bell } from 'lucide-react';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/admin/kyc', icon: FileCheck, label: 'KYC Review' },
  { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-primary-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
          <div className="w-9 h-9 bg-accent-500 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: 'DM Sans' }}>TransFast</span>
            <p className="text-xs text-primary-300 flex items-center gap-1"><Shield size={10} /> Admin Panel</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-primary-300" /></button>
        </div>

        <div className="px-4 py-4 border-b border-primary-800">
          <div className="flex items-center gap-3 bg-primary-800 rounded-xl px-3 py-2.5">
            <div className="w-9 h-9 bg-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-accent-500 text-white' : 'text-primary-300 hover:bg-primary-800 hover:text-white'}`
            }>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-primary-800">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-all w-full">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">Admin Control Center</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
