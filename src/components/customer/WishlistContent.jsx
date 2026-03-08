'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiX, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore, useCartStore } from '@/store';
import toast from 'react-hot-toast';

export default function WishlistContent() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    removeItem(product._id);
    toast.success('Added to cart!');
  };

  if (!mounted) {
    return (
      <div className="container py-8">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="text-4xl text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Save your favorite items to purchase later.
          </p>
          <Link href="/collections" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-heading">My Wishlist</h1>
          <p className="text-gray-500 dark:text-gray-400">{items.length} items saved</p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-2"
        >
          <FiTrash2 size={16} />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product._id} className="card group overflow-hidden">
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-800">
              <Link href={`/product/${product.slug}`}>
                <img
                  src={product.images?.[0] || product.image || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </Link>

              <button
                onClick={() => removeItem(product._id)}
                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-md"
              >
                <FiX size={18} />
              </button>

              {product.comparePrice > product.price && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                  Sale
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full btn btn-primary text-sm py-2.5 shadow-lg"
                >
                  <FiShoppingCart className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>

            <div className="p-4">
              <Link href={`/collections?category=${product.category?.slug}`}>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">
                  {product.category?.name || 'Uncategorized'}
                </span>
              </Link>

              <Link href={`/product/${product.slug}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    ${(parseFloat(product.price) || 0).toFixed(2)}
                  </span>
                  {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      ${(parseFloat(product.comparePrice) || 0).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/collections" className="btn btn-outline">
          Continue Shopping <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
