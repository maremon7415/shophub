'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiShoppingBag, FiHeart, FiUser, FiSearch } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user } = useAuthStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/collections', icon: FiShoppingBag, label: 'Shop' },
    { path: '/search', icon: FiSearch, label: 'Search' },
    { path: '/wishlist', icon: FiHeart, label: 'Wishlist', count: wishlistCount },
    { path: user ? '/account' : '/login', icon: FiUser, label: user ? 'Account' : 'Login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 relative ${
                active
                  ? 'text-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
