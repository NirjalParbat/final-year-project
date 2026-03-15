import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Package, BookOpen, Users, Star,
  LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import logoImg from '../images/logo.png';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/packages', icon: Package, label: 'Packages' },
  { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-brand-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close */}
        <button
          className="absolute top-4 right-4 lg:hidden text-primary-300 hover:text-white p-1 rounded-lg hover:bg-primary-800 transition-colors"
          onClick={closeSidebar}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-5 border-b border-primary-800">
          <Link to="/" onClick={closeSidebar} className="flex items-center gap-2.5 group">
            <img src={logoImg} alt="Ghumfir" className="h-9 w-auto object-contain" />
            <span className="text-xs font-medium text-primary-300 group-hover:text-secondary-300 transition-colors">Admin Panel</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-secondary-400/20 text-secondary-300 ring-1 ring-secondary-400/30'
                    : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-secondary-400 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-primary-300">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-primary-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-brand-border px-4 py-3 flex-shrink-0 shadow-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-brand-muted hover:bg-brand-bg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Ghumfir" className="h-8 w-auto object-contain" />
          </Link>
          <span className="text-xs text-brand-muted">Admin Panel</span>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
