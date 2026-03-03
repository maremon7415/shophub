'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5 dark:bg-transparent'
      }`}>
      <div className="container">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold font-display text-primary">
              Shop<span className="text-accent">Hub</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${pathname === '/' ? 'text-accent' : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'}`}
            >
              Home
            </Link>
            <Link
              href="/collections"
              className={`font-medium transition-colors ${pathname?.startsWith('/collections') ? 'text-accent' : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'}`}
            >
              Collections
            </Link>
            <div className="relative group">
              <button className="flex items-center font-medium text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-amber-400 transition-colors py-2">
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
            <Link
              href="/about"
              className={`font-medium transition-colors ${pathname === '/about' ? 'text-accent' : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`font-medium transition-colors ${pathname === '/contact' ? 'text-accent' : 'text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Action Icons */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />

            <Link href="/search" className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
              <FiSearch size={22} />
            </Link>

            <Link href="/wishlist" className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors relative">
              <FiHeart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors relative">
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
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-accent transition-colors"
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
            <Link href="/search" className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
              <FiSearch size={22} />
            </Link>

            <Link href="/cart" className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors relative">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors z-50 relative"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={26} />
            </button>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Drawer Content */}
        <div
          className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
            <span className="text-xl font-bold font-display text-primary dark:text-white">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-red-400 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 pb-24">
            <nav className="flex flex-col space-y-6">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent transition-colors">
                Home
              </Link>

              <div className="space-y-2">
                <button
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  className="flex items-center justify-between w-full text-lg font-bold text-gray-900 dark:text-white py-2 group"
                >
                  <span>Explore Collections</span>
                  <FiChevronDown className={`transform transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180 text-accent' : 'text-gray-400 group-hover:text-accent'}`} />
                </button>
                <div
                  className={`grid grid-cols-1 gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isCategoriesExpanded ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pl-4 border-l-2 border-amber-500/30 dark:border-amber-500/30 ml-2 space-y-1">
                    <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent hover:translate-x-1 transition-all font-medium">Shop All</Link>
                    {categories?.map((cat) => (
                      <Link key={cat._id} href={`/collections?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent hover:translate-x-1 transition-all">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent transition-colors">About Us</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent transition-colors">Contact</Link>

              <div className="pt-8 mt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col space-y-5">
                <div className="flex items-center justify-between px-2 bg-gray-50 dark:bg-slate-800/50 py-3 rounded-xl">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Theme Preference</span>
                  <ThemeToggle />
                </div>

                <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent py-2">
                  <FiHeart className="mr-3 text-accent" size={22} />
                  <span className="font-medium">My Wishlist</span>
                  {wishlistCount > 0 && <span className="ml-2 bg-gray-200 dark:bg-slate-700 text-xs px-2 py-1 rounded-full">{wishlistCount}</span>}
                </Link>

                {user ? (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-medium text-lg shadow-soft">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white leading-tight">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex flex-row items-center text-gray-700 dark:text-gray-300 py-2"><FiUser className="mr-3" size={20} /> Account Details</Link>
                    <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-row items-center text-gray-700 dark:text-gray-300 py-2"><FiShoppingCart className="mr-3" size={20} /> Order History</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex flex-row items-center text-accent font-medium py-2">Admin Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="flex flex-row items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 px-4 rounded-xl mt-4 w-full transition-colors font-medium">
                      <FaSignOutAlt className="mr-3" size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary w-full text-center py-3 text-lg">
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
