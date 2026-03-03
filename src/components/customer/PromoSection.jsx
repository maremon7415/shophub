'use client';

import Link from 'next/link';

export default function PromoSection() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
              alt="Summer Sale"
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent flex items-center">
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-accent text-white text-sm font-medium rounded-full mb-4">
                  Limited Time
                </span>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Summer Sale
                </h3>
                <p className="text-gray-200 mb-4">
                  Up to 50% off on selected items
                </p>
                <Link href="/collections?sale=true" className="btn btn-primary">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
              alt="New Collection"
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent flex items-center">
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-secondary text-white text-sm font-medium rounded-full mb-4">
                  New Arrivals
                </span>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Fresh Styles
                </h3>
                <p className="text-gray-200 mb-4">
                  Check out the latest trends
                </p>
                <Link href="/collections?newArrival=true" className="btn btn-secondary">
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors">
            <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Free Shipping</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">On orders over $50</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors">
            <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Secure Payment</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">100% secure checkout</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors">
            <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Returns</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">30-day return policy</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors">
            <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">24/7 Support</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dedicated support team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
