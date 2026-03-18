'use client';

import { useState } from 'react';
import { FiBell, FiCheck, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StockNotification({ product }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubscribed(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (product.stock > 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <FiBell className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
            Out of Stock
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
            Be the first to know when this product is available again.
          </p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
              <FiCheck className="shrink-0" />
              <span>You&apos;ll be notified when it&apos;s back in stock!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {loading ? '...' : 'Notify Me'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
