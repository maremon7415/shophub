'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiGrid, FiUsers, FiShoppingCart, FiPercent, FiImage, FiSettings, FiLogOut, FiMenu, FiX, FiStar, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuthStore } from '@/store';
import ThemeToggle from '@/components/ui/ThemeToggle';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: FiPackage, label: 'Products', href: '/admin/products' },
  { icon: FiGrid, label: 'Categories', href: '/admin/categories' },
  { icon: FiShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: FiStar, label: 'Reviews', href: '/admin/reviews' },
  { icon: FiUsers, label: 'Users', href: '/admin/users' },
  { icon: FiPercent, label: 'Coupons', href: '/admin/coupons' },
  { icon: FiImage, label: 'Banners', href: '/admin/banners' },
  { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [badges, setBadges] = useState({ pendingOrders: 0, lowStockProducts: 0, pendingReviews: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';
      if (!token) return;

      const res = await fetch('/api/admin/metrics/badges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (err) {
      console.error('Failed to fetch badges', err);
    }
  };

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
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-gray-200 transform transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className={`p-6 flex items-center justify-between h-20 ${isCollapsed ? 'justify-center px-0' : ''}`}>
          {!isCollapsed ? (
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-2xl font-bold font-display">
                Shop<span className="text-accent">Hub</span>
              </span>
              <span className="ml-2 px-2 py-0.5 bg-accent text-xs rounded">Admin</span>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="flex items-center justify-center w-full">
              <span className="text-2xl font-bold font-display text-accent">S</span>
            </Link>
          )}

          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Collapsible Toggle for Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-slate-800 text-gray-400 hover:text-white border border-slate-700 rounded-full items-center justify-center z-50 shadow-sm"
        >
          {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        <nav className="mt-2 px-3 flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            // Determine badge count
            let badgeCount = 0;
            if (item.label === 'Orders') badgeCount = badges.pendingOrders;
            if (item.label === 'Products') badgeCount = badges.lowStockProducts;
            if (item.label === 'Reviews') badgeCount = badges.pendingReviews;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors relative group ${
                  isActive 
                    ? 'bg-accent text-white' 
                    : 'text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                
                {/* Notification Badge */}
                {badgeCount > 0 && (
                  <span className={`flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ${
                    isCollapsed 
                      ? 'absolute top-2 right-2 w-4 h-4'
                      : 'px-2 py-0.5 min-w-[20px]'
                  }`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                    {badgeCount > 0 && <span className="ml-2 text-red-400">({badgeCount})</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 w-full text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-slate-800 rounded-lg transition-colors group relative`}
          >
            <FiLogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 transition-colors h-20">
          <div className="flex items-center justify-between px-4 lg:px-8 h-full gap-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <FiMenu size={24} />
              </button>
              
              {/* Breadcrumb / Search */}
              <div className="hidden md:flex bg-gray-100 dark:bg-slate-700/50 rounded-full px-4 py-2 items-center gap-2 max-w-md w-full border border-transparent focus-within:border-accent focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                <FiSearch className="text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search orders, products, users..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-none mb-1">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                    Administrator
                  </p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-accent to-orange-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm ring-2 ring-white dark:ring-slate-800">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
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
