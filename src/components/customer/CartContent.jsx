'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function CartContent() {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  const [swipeOffset, setSwipeOffset] = useState({});
  const [touchStart, setTouchStart] = useState({});

  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { user } = useAuthStore();

  const subtotal = getTotal() || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08 || 0;
  const discount = coupon ? (coupon.discountType === 'percentage'
    ? subtotal * (coupon.discountValue / 100)
    : coupon.discountValue) : 0;
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await fetch(`/api/coupons?code=${couponCode}`);
      const data = await res.json();

      if (res.ok && data.coupons?.length > 0) {
        const couponData = data.coupons[0];
        if (new Date() > new Date(couponData.expiryDate)) {
          toast.error('Coupon expired');
          return;
        }
        if (!couponData.isActive) {
          toast.error('Coupon not active');
          return;
        }
        setCoupon(couponData);
        toast.success('Coupon applied!');
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (err) {
      toast.error('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
  };

  const handleTouchStart = (e, id) => {
    setTouchStart({ ...touchStart, [id]: e.targetTouches[0].clientX });
  };
  
  const handleTouchMove = (e, id) => {
    if (!touchStart[id]) return;
    const currentDiff = e.targetTouches[0].clientX - touchStart[id];
    if (currentDiff < 0) {
       setSwipeOffset({ ...swipeOffset, [id]: Math.max(-80, currentDiff) });
    } else {
       setSwipeOffset({ ...swipeOffset, [id]: Math.min(0, currentDiff) });
    }
  };
  
  const handleTouchEnd = (id) => {
    if (swipeOffset[id] <= -40) {
       setSwipeOffset({ ...swipeOffset, [id]: -80 });
    } else {
       setSwipeOffset({ ...swipeOffset, [id]: 0 });
    }
    setTouchStart({ ...touchStart, [id]: 0 });
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart className="text-4xl text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/collections" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-8 dark:text-white pt-20 lg:pt-0">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card overflow-hidden">
            <div className="divide-y dark:divide-slate-700">
              {items.map((item) => {
                const itemId = `${item._id}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
                return (
                <div key={itemId} className="relative overflow-hidden group border-b last:border-0 dark:border-slate-700">
                  <div 
                    className="p-4 sm:p-6 flex gap-4 sm:gap-6 bg-white dark:bg-slate-800 relative z-10 transition-transform duration-200"
                    style={{ transform: `translateX(${swipeOffset[itemId] || 0}px)` }}
                    onTouchStart={(e) => handleTouchStart(e, itemId)}
                    onTouchMove={(e) => handleTouchMove(e, itemId)}
                    onTouchEnd={() => handleTouchEnd(itemId)}
                  >
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <img
                        src={item.image || (item.images && item.images[0]) || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="truncate">
                          <Link href={`/product/${item.slug}`} className="font-semibold dark:text-white hover:text-accent dark:hover:text-accent truncate block">
                            {item.name}
                          </Link>
                          {item.size && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Color: {item.color}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item._id, item.size, item.color)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors hidden sm:block"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900/50">
                          <button
                            onClick={() => updateQuantity(item._id, (parseInt(item.quantity, 10) || 1) - 1, item.size, item.color)}
                            disabled={(parseInt(item.quantity, 10) || 1) <= 1}
                            className="p-2 sm:p-3 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 dark:text-white transition-colors active:scale-90"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 sm:w-10 text-center font-medium dark:text-white text-sm sm:text-base">{parseInt(item.quantity, 10) || 1}</span>
                          <button
                            onClick={() => updateQuantity(item._id, (parseInt(item.quantity, 10) || 1) + 1, item.size, item.color)}
                            className="p-2 sm:p-3 hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-white transition-colors active:scale-90"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold dark:text-white sm:text-lg">${((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)).toFixed(2)}</p>
                          {item.comparePrice > item.price && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${((parseFloat(item.comparePrice) || 0) * (parseInt(item.quantity, 10) || 1)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Swipe Actions Background */}
                  <div className="absolute top-0 right-0 bottom-0 w-20 bg-red-500 flex items-center justify-center z-0">
                    <button 
                      onClick={() => removeItem(item._id, item.size, item.color)}
                      className="w-full h-full flex items-center justify-center text-white active:bg-red-600 transition-colors"
                    >
                      <FiTrash2 size={24} />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 sticky top-28">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Summary</h2>

            {!coupon && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="input flex-1"
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="btn btn-outline"
                >
                  {applyingCoupon ? 'Apply' : 'Apply'}
                </button>
              </div>
            )}

            {coupon && (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-6">
                <div>
                  <span className="font-medium text-green-700 dark:text-green-400">{coupon.code}</span>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% off`
                      : `$${coupon.discountValue} off`}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                  <FiTrash2 />
                </button>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="font-medium dark:text-white">${(parseFloat(subtotal) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                <span className="font-medium dark:text-white">
                  {shipping === 0 ? <span className="text-green-500 dark:text-green-400">Free</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Free shipping on orders over $50</p>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tax (8%)</span>
                <span className="font-medium dark:text-white">${(parseFloat(tax) || 0).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500 dark:text-green-400">
                  <span>Discount</span>
                  <span>-${(parseFloat(discount) || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t dark:border-slate-700 pt-3 flex justify-between text-lg font-bold dark:text-white">
                <span>Total</span>
                <span>${(parseFloat(total) || 0).toFixed(2)}</span>
              </div>
            </div>

            <Link
              href={user ? '/checkout' : '/login?redirect=/checkout'}
              className="btn btn-primary w-full"
            >
              Proceed to Checkout <FiArrowRight className="ml-2" />
            </Link>

            <Link href="/collections" className="block text-center text-sm text-gray-500 dark:text-gray-400 mt-4 hover:text-accent dark:hover:text-accent">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Summary */}
      <div className="lg:hidden fixed bottom-[64px] left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 p-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] safe-area-bottom pb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-500 dark:text-gray-400">Total <span className="text-xs">({items.length} items)</span></div>
          <div className="text-xl font-bold dark:text-white">${parseFloat(total || 0).toFixed(2)}</div>
        </div>
        <Link
          href={user ? '/checkout' : '/login?redirect=/checkout'}
          className="btn btn-primary w-full shadow-lg active:scale-95 py-3 flex items-center justify-center"
        >
          Checkout Now <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
