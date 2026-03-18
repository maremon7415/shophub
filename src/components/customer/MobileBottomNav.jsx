'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiHome, FiShoppingBag, FiHeart, FiUser, FiSearch } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user } = useAuthStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/collections', icon: FiShoppingBag, label: 'Shop' },
    { path: '/cart', icon: FiShoppingBag, label: 'Cart', count: cartCount },
    { path: '/search', icon: FiSearch, label: 'Search' },
    { path: user ? '/account' : '/login', icon: FiUser, label: user ? 'Account' : 'Login' },
    { path: '/wishlist', icon: FiHeart, label: 'Wishlist', count: wishlistCount },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 z-50 lg:hidden safe-area-bottom transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 active:scale-90 relative ${
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
