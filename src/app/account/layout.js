'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage || !JSON.parse(authStorage).state?.user) {
      router.push('/login');
    }
  }, [router]);

  const menuItems = [
    { icon: FiUser, label: 'My Profile', href: '/account', description: 'Account details' },
    { icon: FiPackage, label: 'My Orders', href: '/account/orders', description: 'Track orders' },
    { icon: FiHeart, label: 'Wishlist', href: '/wishlist', description: 'Saved items' },
    { icon: FiSettings, label: 'Settings', href: '/account/settings', description: 'Preferences' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="container py-6 md:py-10 pt-24 lg:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 mt-0 lg:mt-[100px]">
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
              >
                <span className="font-semibold dark:text-white">My Account</span>
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>

            <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                      <p className="text-sm text-white/80 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <nav className="p-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
                  >
                    <FiLogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
