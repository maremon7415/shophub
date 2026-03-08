'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useCartStore, useWishlistStore, useAuthStore } from '@/store';
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiUser, FiSearch, FiChevronDown } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, logout } = useAuthStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/categories?activeOnly=true&hierarchical=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('API returned non-array:', data);
          setCategories([]);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinkClass = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname?.startsWith(path);
    if (isActive) return 'text-accent font-medium transition-colors';
    return `font-medium transition-colors ${
      isHomePage && !isScrolled
        ? 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
        : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'
    }`;
  };

  const iconClass = `p-2 transition-colors relative ${
    isHomePage && !isScrolled
      ? 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
      : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'
  }`;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isHomePage 
          ? (isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft py-3' : 'bg-transparent dark:bg-transparent')
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft py-3'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold font-display ${isHomePage && !isScrolled ? 'text-white' : 'text-primary dark:text-white'}`}>
                Shop<span className="text-accent">Hub</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link href="/collections" className={navLinkClass('/collections')}>
                Collections
              </Link>
              <div className="relative group">
                <button className={`flex items-center font-medium transition-colors py-2 ${
                  isHomePage && !isScrolled
                    ? 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-amber-400'
                }`}>
                  Categories <FiChevronDown className="ml-1 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-[80%] left-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-hover opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-full transition-all duration-300 transform origin-top border border-gray-100 dark:border-slate-700/50">
                  <div className="py-2">
                    <Link
                      href="/collections"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-slate-700/50 hover:text-accent transition-colors font-medium border-b border-gray-100 dark:border-slate-700/50"
                    >
                      Shop All
                    </Link>
                    {categories?.map((category) => (
                      <Link
                        key={category._id}
                        href={`/collections?category=${category.slug}`}
                        className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-slate-700/50 hover:text-accent transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/about" className={navLinkClass('/about')}>
                About
              </Link>
              <Link href="/contact" className={navLinkClass('/contact')}>
                Contact
              </Link>
            </nav>

            {/* Desktop Action Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* <div className={isHomePage && !isScrolled ? 'brightness-0 invert' : ''}>
                <ThemeToggle />
              </div> */}

              <Link href="/search" className={iconClass}>
                <FiSearch size={22} />
              </Link>

              <Link href="/wishlist" className={iconClass}>
                <FiHeart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className={iconClass}>
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center space-x-2 p-2 transition-colors ${
                      isHomePage && !isScrolled
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-700 hover:text-accent'
                    }`}
                  >
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-medium shadow-soft">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-hover py-2 animate-fade-in border border-gray-100 dark:border-slate-700">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/account" className="block px-4 py-2 mt-1 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-accent dark:hover:text-accent transition-colors">
                        <FiUser className="inline mr-2" /> My Account
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-accent dark:hover:text-accent transition-colors">
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-accent dark:hover:text-accent transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 mt-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FaSignOutAlt className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary text-sm px-6">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Action Icons */}
            <div className="flex lg:hidden items-center space-x-3">
              <Link href="/search" className={iconClass}>
                <FiSearch size={22} />
              </Link>

              <Link href="/cart" className={iconClass}>
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* <div className={isHomePage && !isScrolled ? 'brightness-0 invert' : ''}>
                <ThemeToggle />
              </div> */}

              <button
                className={`${iconClass} relative ml-1`}
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <FiMenu size={28} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Redesigned Mobile Drawer Overlay (OUTSIDE HEADER) */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Redesigned Mobile Drawer Content (OUTSIDE HEADER) */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-[85%] max-w-[360px] bg-white dark:bg-slate-900 z-[110] shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header - Premium Gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-2xl font-bold font-display text-white drop-shadow-sm">
              ShopHub
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-900 pb-24">
          
          {/* User Profile Summary (If logged in) */}
          {user ? (
            <div className="p-6 bg-white dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xl ring-4 ring-orange-500/20">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center py-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-700 transition duration-200">
                  <FiUser className="text-amber-500 mb-1" size={20} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Account</span>
                </Link>
                <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center py-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-700 transition duration-200">
                  <FiShoppingCart className="text-amber-500 mb-1" size={20} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Orders</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Welcome!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in to access your orders, wishlist, and profile.</p>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary w-full text-center py-3 shadow-md">
                Sign In / Register
              </Link>
            </div>
          )}

          <nav className="p-4 space-y-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
              Home
            </Link>

            {/* Categories Accordion */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className="w-full flex items-center justify-between px-4 py-4 text-base font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                Explore
                <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180 bg-amber-50 text-amber-500' : ''}`}>
                  <FiChevronDown />
                </div>
              </button>
              
              <div
                className={`transition-all duration-300 ease-in-out bg-gray-50/50 dark:bg-slate-800/50 ${isCategoriesExpanded ? 'max-h-[800px] opacity-100 border-t border-gray-100 dark:border-slate-700' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-3 grid grid-cols-1 gap-1">
                  <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    ✨ Shop All
                  </Link>
                  {categories?.map((cat) => (
                    <Link key={cat._id} href={`/collections?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 mr-3"></span> {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
              About Us
            </Link>
            
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
              Contact
            </Link>
          </nav>

        </div>

        {/* Sticky Footer Area */}
        {user && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
            <button onClick={handleLogout} className="flex items-center justify-center w-full py-3 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              <FaSignOutAlt className="mr-2" size={18} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
