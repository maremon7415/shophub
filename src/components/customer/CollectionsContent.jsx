'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiFilter, FiX, FiShoppingCart, FiHeart, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/store';
import toast from 'react-hot-toast';

export default function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bestSeller: searchParams.get('bestSeller') || '',
    newArrival: searchParams.get('newArrival') || '',
    featured: searchParams.get('featured') || '',
  });

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [expandedFilters, setExpandedFilters] = useState({ category: true, price: true, rating: false });

  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?activeOnly=true');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page);
      params.append('limit', 12);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    router.push(`/collections?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subCategory: '',
      search: '',
      sort: '-createdAt',
      minPrice: '',
      maxPrice: '',
      bestSeller: '',
      newArrival: '',
      featured: '',
    });
    router.push('/collections');
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

  const toggleFilter = (filter) => {
    setExpandedFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Top Rated' },
    { value: '-soldCount', label: 'Best Selling' },
  ];

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && !['-createdAt'].includes(v)
  ).length;

  return (
    <div className="container">
      <div className="flex flex-col lg:flex-row gap-8">
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}
        
        <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto transition-colors
            ${showFilters ? 'fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 overflow-y-auto rounded-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear All ({activeFiltersCount})
                  </button>
                )}
                {showFilters && (
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <button
                  onClick={() => toggleFilter('category')}
                  className="flex items-center justify-between w-full font-medium mb-3"
                >
                  Category
                  {expandedFilters.category ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {expandedFilters.category && (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.category}
                        onChange={() => updateFilters('category', '')}
                        className="mr-2"
                      />
                      All Categories
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat.slug}
                          onChange={() => updateFilters('category', cat.slug)}
                          className="mr-2"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full font-medium mb-3"
                >
                  Price Range
                  {expandedFilters.price ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {expandedFilters.price && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters('minPrice', e.target.value)}
                      className="input text-sm py-2"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters('maxPrice', e.target.value)}
                      className="input text-sm py-2"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.bestSeller === 'true'}
                      onChange={(e) => updateFilters('bestSeller', e.target.checked ? 'true' : '')}
                      className="mr-2"
                    />
                    Best Sellers
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.newArrival === 'true'}
                      onChange={(e) => updateFilters('newArrival', e.target.checked ? 'true' : '')}
                      className="mr-2"
                    />
                    New Arrivals
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured === 'true'}
                      onChange={(e) => updateFilters('featured', e.target.checked ? 'true' : '')}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-primary dark:text-white">
                {filters.category
                  ? categories.find((c) => c.slug === filters.category)?.name || 'Products'
                  : 'All Products'}
              </h1>
              <p className="text-gray-500">
                {pagination.total} products found
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn btn-outline py-2 relative"
              >
                <FiFilter className="mr-2" /> Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={filters.sort}
                onChange={(e) => updateFilters('sort', e.target.value)}
                className="input py-2 w-48 bg-white dark:bg-slate-800 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="hidden sm:flex border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary dark:bg-accent text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary dark:bg-accent text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton h-64" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No products found</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <div key={product._id} className="card group">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <Link href={`/product/${product.slug}`}>
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${viewMode === 'grid' ? '' : 'lg:h-48'
                            }`}
                        />
                      </Link>

                      {product.comparePrice > product.price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          SALE
                        </span>
                      )}

                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isInWishlist(product._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                      >
                        <FiHeart className={isInWishlist(product._id) ? 'fill-current' : ''} />
                      </button>

                      {viewMode === 'grid' && (
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full btn btn-primary text-sm py-2"
                          >
                            <FiShoppingCart className="mr-2" /> Add to Cart
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <Link href={`/collections?category=${product.category?.slug}`}>
                        <span className="text-xs text-accent font-medium uppercase">
                          {product.category?.name}
                        </span>
                      </Link>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-accent">
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
                        <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0})</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-primary dark:text-white">
                            ${product.price?.toFixed(2)}
                          </span>
                          {product.comparePrice > product.price && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${product.comparePrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {viewMode === 'list' && (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="mt-4 btn btn-outline w-full"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setPagination((prev) => ({ ...prev, page }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-lg transition-colors ${pagination.page === page
                            ? 'bg-primary dark:bg-accent text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
