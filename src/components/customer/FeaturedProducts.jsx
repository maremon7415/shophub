'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/store';
import toast from 'react-hot-toast';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bestSeller');

  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton h-64" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="card group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <Link href={`/product/${product.slug}`}>
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {product.comparePrice > product.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </span>
                  )}

                  {product.newArrival && (
                    <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 btn btn-primary text-sm py-2"
                      >
                        <FiShoppingCart className="mr-2" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`p-2 rounded-lg transition-colors ${isInWishlist(product._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                      >
                        <FiHeart />
                      </button>
                    </div>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-white"
                  >
                    <FiEye size={18} />
                  </Link>
                </div>

                <div className="p-4">
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
