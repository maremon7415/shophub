'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiShoppingCart, FiHeart, FiStar, FiFilter } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/store';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    if (initialQuery) {
      searchProducts(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (query.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(query);
      }, 300);
    } else {
      setResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters]);

  const searchProducts = async (searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort !== 'relevance') params.append('sort', filters.sort);
      params.append('limit', '20');

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Search Products</h1>
          
          <div className="relative mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="input pl-12 pr-10 py-4 text-lg"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline px-6"
              >
                <FiFilter className="mr-2" /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg p-4 z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="input"
                    >
                      <option value="">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="input"
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="input"
                      placeholder="$999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                      className="input"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4">
                  <div className="skeleton h-48 mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12">
              <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start searching</h2>
              <p className="text-gray-500">Enter at least 2 characters to search</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-gray-500">Try different keywords or adjust filters</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-4">{results.length} results for "{query}"</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl shadow-card overflow-hidden group">
                    <div className="relative aspect-[4/3]">
                      <Link href={`/product/${product.slug}`}>
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      {product.comparePrice > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          SALE
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 btn btn-primary text-sm py-2"
                          >
                            <FiShoppingCart className="mr-1" /> Add
                          </button>
                          <button
                            onClick={() => handleWishlistToggle(product)}
                            className={`p-2 rounded-lg ${
                              isInWishlist(product._id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <FiHeart className={isInWishlist(product._id) ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link href={`/collections?category=${product.category?.slug}`}>
                        <span className="text-xs text-accent uppercase">
                          {product.category?.name || 'General'}
                        </span>
                      </Link>
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold mt-1 line-clamp-2 hover:text-accent">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center mt-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`${i < Math.round(product.rating || 0) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-lg font-bold">${product.price?.toFixed(2)}</span>
                          {product.comparePrice > product.price && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              ${product.comparePrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
