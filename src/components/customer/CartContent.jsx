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
              {items.map((item) => (
                <div key={`${item._id}-${item.size}-${item.color}`} className="p-6 flex gap-6">
                  <Link href={`/product/${item.slug}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/product/${item.slug}`} className="font-semibold dark:text-white hover:text-accent dark:hover:text-accent">
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">Color: {item.color}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item._id, item.size, item.color)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border dark:border-slate-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, (parseInt(item.quantity, 10) || 1) - 1, item.size, item.color)}
                          disabled={(parseInt(item.quantity, 10) || 1) <= 1}
                          className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 dark:text-white"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-4 font-medium dark:text-white">{parseInt(item.quantity, 10) || 1}</span>
                        <button
                          onClick={() => updateQuantity(item._id, (parseInt(item.quantity, 10) || 1) + 1, item.size, item.color)}
                          className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold dark:text-white">${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}</p>
                        {item.comparePrice && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${((parseFloat(item.comparePrice) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
