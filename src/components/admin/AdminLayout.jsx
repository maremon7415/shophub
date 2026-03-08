'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiGrid, FiUsers, FiShoppingCart, FiPercent, FiImage, FiSettings, FiLogOut, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useAuthStore } from '@/store';
import { useTheme } from 'next-themes';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: FiPackage, label: 'Products', href: '/admin/products' },
  { icon: FiGrid, label: 'Categories', href: '/admin/categories' },
  { icon: FiShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: FiUsers, label: 'Users', href: '/admin/users' },
  { icon: FiPercent, label: 'Coupons', href: '/admin/coupons' },
  { icon: FiImage, label: 'Banners', href: '/admin/banners' },
  { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('auth-storage');
    if (!token) {
      window.location.href = '/login';
    } else {
      const parsed = JSON.parse(token);
      if (!parsed.state?.user || parsed.state?.user?.role !== 'admin') {
        window.location.href = '/login';
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary dark:bg-slate-900 text-white dark:text-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={theme === 'dark' ? { backgroundColor: '#0f172a' } : {}}
      >
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-2xl font-bold font-display">
              Shop<span className="text-accent">Hub</span>
            </span>
            <span className="ml-2 px-2 py-0.5 bg-accent text-xs rounded">Admin</span>
          </Link>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent text-white' 
                    : 'text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 transition-colors">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <FiMenu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium">{user?.name || 'Admin'}</span>
              </span>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
