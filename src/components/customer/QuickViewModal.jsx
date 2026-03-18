'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiHeart, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useQuickViewStore, useCartStore, useWishlistStore } from '@/store';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setSelectedImage(0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart!');
    closeQuickView();
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : ['/placeholder.jpg']);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto w-full h-full">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
        aria-hidden="true"
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[85vh] animate-slide-up transform my-auto">
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>

        {/* Image Gallery Sub-Section */}
        <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-slate-800 p-4 sm:p-8 flex flex-col justify-center items-center">
          <div className="aspect-[4/5] w-full max-w-sm rounded-xl overflow-hidden bg-white dark:bg-slate-700 relative mb-4">
            <img 
              src={images[selectedImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.comparePrice > product.price && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                SALE
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 w-full max-w-sm overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Sub-Section */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 overflow-y-auto">
          <div className="mb-6">
            <span className="text-xs text-accent font-medium uppercase tracking-wider mb-2 block">
              {product.category?.name || 'General'}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">({product.reviewCount || 0})</span>
              </div>
            </div>
            <div className="flex items-end gap-3 font-display">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(parseFloat(product.price) || 0).toFixed(2)}
              </span>
              {product.comparePrice > product.price && (
                <span className="text-lg text-gray-500 line-through mb-1">
                  ${(parseFloat(product.comparePrice) || 0).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Description Preview */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                        selectedColor === color ? 'border-accent scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-accent transition-colors text-gray-600 dark:text-gray-300"
                >
                  <FiMinus size={16} />
                </button>
                <span className="w-8 text-center font-medium text-gray-900 dark:text-white text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:text-accent transition-colors text-gray-600 dark:text-gray-300"
                >
                  <FiPlus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <FiShoppingCart size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                 onClick={handleWishlistToggle}
                 className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                   isInWishlist 
                     ? 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30' 
                     : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                 }`}
              >
                 <FiHeart size={22} className={isInWishlist ? 'fill-current' : ''} />
              </button>
            </div>
            
            <div className="pt-2">
               <Link 
                 href={`/product/${product.slug}`}
                 onClick={closeQuickView}
                 className="inline-flex items-center text-sm font-medium text-accent hover:text-accent/80 transition-colors"
               >
                 View full details <FiArrowRight className="ml-1" />
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
