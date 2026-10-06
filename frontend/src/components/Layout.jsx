import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Grid,
  Image as ImageIcon,
  ShoppingBag,
  Store,
  Globe,
  LogOut,
  Menu,
  X,
  Sparkles,
  User,
  Bell
} from 'lucide-react';
import api from '../api';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Boxes },
    { name: 'Categories', path: '/admin/categories', icon: Grid },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Shop Settings', path: '/admin/shop-settings', icon: Store },
    { name: 'Website Settings', path: '/admin/website-settings', icon: Globe },
  ];

  // Helper to check if a path is active
  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white shrink-0 shadow-xl border-r border-gray-800">
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-800">
          <img src="/logo.png" alt="Avira Pyrotech" className="h-10 w-auto object-contain brightness-200" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile details at bottom */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700">
              <User size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-bold truncate">{username}</p>
              <p className="text-xs text-gray-500 font-medium">Store Owner</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-red-950/30 hover:text-red-400 text-gray-400 text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Sidebar (Sliding Menu) */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <aside
          className={`fixed top-0 bottom-0 left-0 w-72 bg-gray-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
            <div className="flex items-center">
              <img src="/logo.png" alt="Avira Pyrotech" className="h-10 w-auto object-contain brightness-200" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer User */}
          <div className="p-6 border-t border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700">
                <User size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold truncate">{username}</p>
                <p className="text-xs text-gray-500">Store Owner</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-850 hover:bg-red-950/30 hover:text-red-400 text-gray-400 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm shrink-0 no-print">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Menu size={22} />
          </button>

          {/* Page context context label */}
          <div className="hidden lg:block">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit">
              Avira Pyrotech Administration
            </span>
          </div>

          {/* Small mobile logo brand */}
          <div className="lg:hidden flex items-center">
            <img src="/logo.png" alt="Avira Pyrotech" className="h-9 w-auto object-contain" />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="relative p-2 text-gray-500 hover:bg-gray-150 hover:text-gray-800 rounded-xl transition-all"
            >
              <Bell size={20} />
              {/* Optional notifications bubble */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </Link>
            
            <div className="w-[1px] h-6 bg-gray-250"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 hidden sm:inline-block">
                Welcome, {username}
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs select-none">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>

    </div>
  );
}
