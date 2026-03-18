'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiRepeat } from 'react-icons/fi';
import { useRecentStore, useCartStore, useWishlistStore, useCompareStore } from '@/store';
import toast from 'react-hot-toast';

export default function RecentProducts({ currentProductId = null }) {
  const [mounted, setMounted] = useState(false);
  const recentItems = useRecentStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { items: compareItems, addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompareStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter out the current product from the recently viewed list
  const displayItems = recentItems.filter(item => item._id !== currentProductId).slice(0, 8);

  if (displayItems.length === 0) return null;

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

  return (
    <section className="py-12 border-t border-gray-100 dark:border-slate-800">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-primary dark:text-white">
            Recently Viewed
          </h2>
        </div>

        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-6 sm:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayItems.map((product, index) => (
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
                <Link href={`/collections?category=${product.category?.slug || ''}`}>
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
                        className={`${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'
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
      </div>
    </section>
  );
}
