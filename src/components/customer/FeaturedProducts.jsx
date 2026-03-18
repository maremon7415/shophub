'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiRepeat } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useCompareStore, useQuickViewStore } from '@/store';
import toast from 'react-hot-toast';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bestSeller');

  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { items: compareItems, addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompareStore();
  const openQuickView = useQuickViewStore((state) => state.openQuickView);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?limit=8&${activeTab}=true`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some((item) => item._id === product._id);
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const handleCompareToggle = (product) => {
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
      toast.success('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.error('You can only compare up to 4 products');
        return;
      }
      addToCompare(product);
      toast.success('Added to compare');
    }
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  const tabs = [
    { id: 'bestSeller', label: 'Best Sellers' },
    { id: 'newArrival', label: 'New Arrivals' },
    { id: 'featured', label: 'Featured' },
  ];

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-primary dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-4 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card shrink-0 w-[280px] sm:w-auto overflow-hidden border border-gray-100 dark:border-slate-700">
                <div className="skeleton animate-shimmer h-[280px]" />
                <div className="p-5 space-y-4">
                  <div className="skeleton animate-shimmer h-4 w-1/3 rounded-full" />
                  <div className="skeleton animate-shimmer h-5 w-3/4 rounded-full" />
                  <div className="flex items-center gap-2">
                    <div className="skeleton animate-shimmer h-4 w-24 rounded-full" />
                  </div>
                  <div className="skeleton animate-shimmer h-6 w-20 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-6 sm:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="card group animate-fade-in shrink-0 w-[280px] sm:w-auto snap-center relative border border-gray-100 dark:border-slate-700/50 hover:border-amber-200 dark:hover:border-amber-500/30 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-[4/5] bg-gray-50 dark:bg-slate-800 overflow-hidden">
                  <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <img
                      src={product.images?.[0] || product.image || 'https://via.placeholder.com/400x500'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {product.comparePrice > product.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      SALE
                    </span>
                  )}

                  {product.newArrival && (
                    <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      NEW
                    </span>
                  )}

                  {/* Floating Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 sm:opacity-0 sm:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
                    <button
                      onClick={(e) => { e.preventDefault(); handleWishlistToggle(product); }}
                      title="Wishlist"
                      className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${isInWishlist(product._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
                    >
                      <FiHeart size={18} className={isInWishlist(product._id) ? "fill-current" : ""} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleCompareToggle(product); }}
                      title="Compare"
                      className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${isInCompare(product._id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white'
                        }`}
                    >
                      <FiRepeat size={18} />
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="p-2.5 bg-white/90 shadow-md backdrop-blur-md rounded-full text-gray-700 hover:bg-primary hover:text-white transition-all active:scale-90 flex items-center justify-center"
                    >
                      <FiEye size={18} />
                    </Link>
                  </div>

                  {/* Quick Add To Cart */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                      className="w-full btn btn-primary py-2.5 shadow-xl flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FiShoppingCart size={18} /> Add to Cart
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <Link href={`/collections?category=${product.category?.slug}`}>
                    <span className="text-xs text-accent font-medium uppercase">
                      {product.category?.name || 'General'}
                    </span>
                  </Link>

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`${i < Math.round(product.rating || 0) ? 'fill-current' : ''
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-primary dark:text-white">
                        ${(parseFloat(product.price) || 0).toFixed(2)}
                      </span>
                      {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${(parseFloat(product.comparePrice) || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/collections" className="btn btn-outline">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
