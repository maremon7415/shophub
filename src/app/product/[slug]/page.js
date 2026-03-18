'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiTruck, FiRotateCcw, FiShield, FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/store';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import toast from 'react-hot-toast';
import ReviewSection from '@/components/customer/ReviewSection';
import RecentProducts from '@/components/customer/RecentProducts';
import Breadcrumb from '@/components/customer/Breadcrumb';
import StockNotification from '@/components/customer/StockNotification';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [openAccordion, setOpenAccordion] = useState('description');
  
  const addBtnRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Swipe logic
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [bgPos, setBgPos] = useState('50% 50%');
  const [isZoomed, setIsZoomed] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const addRecentItem = useRecentStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        const data = await res.json();
        setProduct(data.product || data);
        if (data.product) {
          addRecentItem(data.product);
        } else if (data._id) {
          addRecentItem(data);
        }
        if (data.product?.sizes?.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
        if (data.product?.colors?.length > 0) {
          setSelectedColor(data.product.colors[0]);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        router.push('/collections');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main button is out of view (scrolled past)
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    if (addBtnRef.current) {
      observer.observe(addBtnRef.current);
    }
    return () => observer.disconnect();
  }, [addBtnRef.current]);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    const isInWishlist = wishlistItems.some((item) => item._id === product._id);
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const isInWishlist = product ? wishlistItems.some((item) => item._id === product._id) : false;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEndAction = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    
    if (distance > 50) {
      nextImage();
    } else if (distance < -50) {
      prevImage();
    }
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return; // Only zoom on desktop
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = (e.clientX - left) / width * 100;
    const y = (e.clientY - top) / height * 100;
    setBgPos(`${x}% ${y}%`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="py-8 pt-24 lg:pt-8">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="skeleton h-96 rounded-2xl" />
              <div className="space-y-4">
                <div className="skeleton h-8 w-3/4" />
                <div className="skeleton h-6 w-1/4" />
                <div className="skeleton h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 mb-4 dark:text-gray-400">Product not found</p>
            <Link href="/collections" className="btn btn-primary">Back to Collections</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="py-8 pt-20 lg:pt-8 transition-colors">
        <div className="container">
          <Breadcrumb 
            items={[
              { label: 'Collections', href: '/collections' },
              { label: product.category?.name || 'Products', href: `/collections?category=${product.category?.slug}` },
              { label: product.name }
            ]}
          />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="relative">
            <div 
              className="relative overflow-hidden rounded-2xl bg-white group cursor-zoom-in shadow-sm lg:shadow-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEndAction}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className={`w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover transition-opacity duration-300 ${isZoomed && window.innerWidth >= 1024 ? 'opacity-0' : 'opacity-100'}`}
              />
              <div 
                className={`hidden lg:block absolute inset-0 bg-no-repeat transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundPosition: bgPos,
                  backgroundSize: '200%',
                }}
              />
              {product.comparePrice > product.price && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  SALE
                </span>
              )}
              {product.newArrival && (
                <span className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  NEW
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === index ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`${i < Math.round(product.rating || 0) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 ml-2">({product.reviewCount || 0} reviews)</span>
              </div>
              {product.stock > 0 ? (
                <span className="text-green-500 text-sm">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-500 text-sm">Out of Stock</span>
              )}
            </div>

            <StockNotification product={product} />

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-accent">${(parseFloat(product.price) || 0).toFixed(2)}</span>
              {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <span className="text-xl text-gray-400 line-through">${(parseFloat(product.comparePrice) || 0).toFixed(2)}</span>
              )}
              {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <span className="text-red-500 font-medium">
                  {Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)}% OFF
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-accent bg-accent text-white'
                          : 'border-gray-300 hover:border-accent'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const isCommonColor = ['black', 'white', 'gray', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'navy', 'brown'].includes(color.toLowerCase());
                    const hexMatch = color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
                    const isColorCode = isCommonColor || hexMatch;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative rounded-full transition-all flex items-center justify-center ${
                          isColorCode ? 'w-10 h-10 border-2' : 'px-4 py-2 border-2'
                        } ${
                          selectedColor === color
                            ? 'border-accent shadow-md scale-110 z-10'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={isColorCode ? { backgroundColor: hexMatch ? color : color.toLowerCase() } : {}}
                        title={color}
                      >
                        {!isColorCode && <span className="text-sm font-medium">{color}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6" ref={addBtnRef}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn btn-primary py-4 text-lg active:scale-95 transition-transform"
              >
                <FiShoppingCart className="mr-2" /> Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`px-4 py-4 border rounded-lg transition-all ${
                  isInWishlist
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <FiHeart className={isInWishlist ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <FiTruck className="mx-auto text-xl text-gray-600 mb-1" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <FiRotateCcw className="mx-auto text-xl text-gray-600 mb-1" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
              <div className="text-center">
                <FiShield className="mx-auto text-xl text-gray-600 mb-1" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-0 sm:p-6 mb-12 overflow-hidden">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex border-b border-gray-100 dark:border-slate-700 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 font-medium border-b-2 transition-all hover:text-accent ${
                activeTab === 'description'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-4 font-medium border-b-2 transition-all hover:text-accent ${
                activeTab === 'shipping'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              }`}
            >
              Shipping Info
            </button>
          </div>

          {/* Desktop Content */}
          <div className="hidden sm:block">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Key Features</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                   <FiTruck className="text-2xl text-accent shrink-0 mt-1" />
                   <div>
                     <h4 className="font-medium text-gray-900 dark:text-white mb-1">Standard & Express Delivery</h4>
                     <p>Free standard shipping on orders over $100. Express shipping options available at checkout.</p>
                     <ul className="mt-2 text-sm text-gray-500">
                       <li>Standard: 5-7 business days</li>
                       <li>Express: 2-3 business days</li>
                     </ul>
                   </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                   <FiRotateCcw className="text-2xl text-accent shrink-0 mt-1" />
                   <div>
                     <h4 className="font-medium text-gray-900 dark:text-white mb-1">30-Day Returns</h4>
                     <p>30-day return policy for unused items in original packaging. Some exclusions apply.</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Accordion */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
            {/* Description Accordion */}
            <div className="group">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                className="w-full flex items-center justify-between p-4 font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800"
              >
                Description
                {openAccordion === 'description' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <div className={`px-4 overflow-hidden transition-all duration-300 ${openAccordion === 'description' ? 'max-h-[1000px] pb-6' : 'max-h-0'}`}>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Key Features</h3>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Accordion */}
            <div className="group">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                className="w-full flex items-center justify-between p-4 font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800"
              >
                Shipping Info
                {openAccordion === 'shipping' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <div className={`px-4 overflow-hidden transition-all duration-300 ${openAccordion === 'shipping' ? 'max-h-[1000px] pb-6' : 'max-h-0'}`}>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 pt-2">
                  <p>Free standard shipping on orders over $100.</p>
                  <p>Standard delivery: 5-7 business days</p>
                  <p>Express delivery: 2-3 business days</p>
                  <p>30-day return policy for unused items.</p>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          <ReviewSection productId={product._id} />
          <RecentProducts currentProductId={product._id} />
          
        </div>
      </div>
      
      {/* Mobile Sticky Add to Cart */}
      <div className={`lg:hidden fixed bottom-[64px] left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] safe-area-bottom transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex gap-3 justify-between items-center max-w-md mx-auto">
          <div className="flex-1">
             <div className="text-xs text-gray-500 mb-0.5">{product.name}</div>
             <div className="font-bold text-accent">${(parseFloat(product.price) * quantity).toFixed(2)}</div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary py-2 px-6 active:scale-95 shadow-md flex-shrink-0"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
