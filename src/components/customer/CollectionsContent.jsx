'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiFilter, FiX, FiShoppingCart, FiHeart, FiStar, FiChevronDown, FiChevronUp, FiRepeat } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useCompareStore } from '@/store';
import toast from 'react-hot-toast';

export default function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const { items: compareItems, addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompareStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(false);
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

  const fetchProducts = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const targetPage = isLoadMore ? pagination.page + 1 : 1;
      params.append('page', targetPage);
      params.append('limit', 12);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      
      if (isLoadMore) {
        setProducts((prev) => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
        
        <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden'} lg:block z-50`}>
          <div className={`bg-white dark:bg-slate-800 lg:rounded-xl shadow-card p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto transition-transform duration-300
            ${showFilters ? 'fixed bottom-0 left-0 w-full max-h-[85vh] rounded-t-3xl overflow-y-auto animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)]' : ''}`}>
            {showFilters && (
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 lg:hidden" />
            )}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl lg:text-lg">Filters</h3>
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

          {loading && !loadingMore ? (
            <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton animate-shimmer h-48 sm:h-64" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton animate-shimmer h-4 w-3/4 rounded" />
                    <div className="skeleton animate-shimmer h-4 w-1/2 rounded" />
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
              <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <div key={product._id} className="card group border border-gray-100 dark:border-slate-700/50 hover:border-amber-200 overflow-hidden">
                    <div className="relative aspect-[4/5] bg-gray-50 dark:bg-slate-800 overflow-hidden">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <img
                          src={product.images?.[0] || product.image || 'https://via.placeholder.com/400x500'}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${viewMode === 'grid' ? '' : 'lg:h-48'
                            }`}
                        />
                      </Link>

                      {product.comparePrice > product.price && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full">
                          SALE
                        </span>
                      )}

                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 z-10">
                        <button
                          onClick={(e) => { e.preventDefault(); handleWishlistToggle(product); }}
                          title="Wishlist"
                          className={`p-1.5 sm:p-2 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${isInWishlist(product._id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                            }`}
                        >
                          <FiHeart size={16} className={isInWishlist(product._id) ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); handleCompareToggle(product); }}
                          title="Compare"
                          className={`p-1.5 sm:p-2 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${isInCompare(product._id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white'
                            }`}
                        >
                          <FiRepeat size={16} />
                        </button>
                      </div>

                      {viewMode === 'grid' && (
                        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 translate-y-[120%] lg:translate-y-full hover:translate-y-0 lg:group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                            className="w-full btn btn-primary text-xs sm:text-sm py-1.5 sm:py-2.5 shadow-xl flex items-center justify-center gap-1 sm:gap-2 active:scale-95"
                          >
                            <FiShoppingCart size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
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
                            ${(parseFloat(product.price) || 0).toFixed(2)}
                          </span>
                          {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${(parseFloat(product.comparePrice) || 0).toFixed(2)}
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

              {pagination.page < pagination.pages && (
                <div className="flex justify-center mt-12 mb-8">
                  <button
                    onClick={() => fetchProducts(true)}
                    disabled={loadingMore}
                    className="btn border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-white min-w-[200px]"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
