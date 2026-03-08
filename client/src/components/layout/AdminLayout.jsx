import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileCheck,
  ScrollText,
  LogOut,
  Globe,
  Shield,
  Menu,
  X,
  Bell
} from 'lucide-react';

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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64
        bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900
        border-r border-white/10
        shadow-2xl flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >

        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">

          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 
          rounded-xl flex items-center justify-center shadow-lg">

            <Globe className="w-5 h-5 text-white" />

          </div>

          <div>
            <span className="font-bold text-xl text-white tracking-wide">
              TransFast
            </span>

            <p className="text-xs text-indigo-200 flex items-center gap-1">
              <Shield size={10} /> Admin Panel
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* USER CARD */}
        <div className="px-4 py-5 border-b border-white/10">

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur 
          rounded-xl px-3 py-3">

            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 
            rounded-full flex items-center justify-center text-white font-semibold">

              {user?.firstName?.[0]}{user?.lastName?.[0]}

            </div>

            <div>
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs text-indigo-200 capitalize">
                {user?.role}
              </p>
            </div>

          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

          {adminNavItems.map(({ to, icon: Icon, label, end }) => (

            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`
              }
            >

              <Icon
                size={18}
                className="group-hover:scale-110 transition-transform"
              />

              <span>{label}</span>

            </NavLink>

          ))}

        </nav>

        {/* LOGOUT */}
        <div className="px-3 py-4 border-t border-white/10">

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
            font-medium text-indigo-200 hover:bg-red-500 hover:text-white
            transition-all w-full"
          >

            <LogOut size={18} />
            <span>Sign Out</span>

          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header
          className="bg-white/70 backdrop-blur-xl border-b border-gray-200
          px-4 lg:px-6 py-3.5 flex items-center justify-between shadow-sm"
        >

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="hidden lg:flex items-center gap-2">

            <Shield className="w-4 h-4 text-indigo-600" />

            <span className="text-sm font-semibold text-gray-700">
              Admin Control Center
            </span>

          </div>

          <div className="ml-auto flex items-center gap-4">

            {/* NOTIFICATION */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">

              <Bell className="w-5 h-5 text-gray-600" />

              <span className="absolute top-1 right-1 w-2.5 h-2.5 
              bg-red-500 rounded-full"></span>

            </button>

            {/* EMAIL */}
            <div className="text-sm text-gray-600">

              <span className="font-medium">{user?.email}</span>

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          <Outlet />

        </main>

      </div>

    </div>
  );
}