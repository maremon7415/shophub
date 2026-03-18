'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiX, FiShoppingCart, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { useCompareStore, useCartStore } from '@/store';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import Breadcrumb from '@/components/customer/Breadcrumb';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearCompare } = useCompareStore();
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const renderFeatureRow = (featureName, getValue) => {
    // Determine if the row is empty across all products
    const isEmpty = items.every((item) => {
      const value = getValue(item);
      return !value || value === '' || value === 'N/A';
    });

    if (isEmpty) return null;

    return (
      <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <th className="py-4 px-6 text-left font-medium text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-slate-800/30 w-48 shrink-0 align-top">
          {featureName}
        </th>
        {items.map((item) => (
          <td key={item._id} className="py-4 px-6 text-gray-900 dark:text-gray-300 align-top min-w-[250px]">
            {getValue(item) || '-'}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 pt-24 lg:pt-12">
        <div className="container">
          <Breadcrumb 
            items={[
              { label: 'Compare Products' }
            ]}
          />
          <div className="mb-8">
            <Link href="/collections" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-accent mb-4 transition-colors">
              <FiChevronLeft className="mr-1" /> Back to shopping
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Compare Products</h1>
              {items.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="btn btn-outline py-2 px-4 shadow-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-slate-700">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="text-4xl text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Your compare list is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Add products to compare them side-by-side and find the perfect match for your needs.
              </p>
              <Link href="/collections" className="btn btn-primary px-8">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
               <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-6 bg-white dark:bg-slate-800/80 sticky left-0 z-20 w-48 shrink-0 shadow-[4px_0_10px_rgba(0,0,0,0.02)] border-b border-gray-100 dark:border-slate-800">
                        {/* Empty top-left corner */}
                      </th>
                      {items.map((item) => (
                        <th key={item._id} className="p-6 min-w-[250px] border-b border-gray-100 dark:border-slate-800 align-top relative group">
                          <button
                            onClick={() => removeItem(item._id)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 text-gray-500 rounded-full transition-colors z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Remove"
                          >
                            <FiX />
                          </button>
                          
                          <Link href={`/product/${item.slug}`} className="block group/link">
                            <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-gray-50 dark:bg-slate-700 relative border border-gray-100 dark:border-slate-600">
                              <img
                                src={item.images?.[0] || item.image || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover/link:text-accent line-clamp-2 leading-snug">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="mt-3 flex items-end gap-2">
                             <span className="text-xl font-bold text-primary dark:text-white">
                               ${(parseFloat(item.price) || 0).toFixed(2)}
                             </span>
                             {item.comparePrice > item.price && (
                               <span className="text-sm text-gray-400 line-through mb-0.5">
                                 ${(parseFloat(item.comparePrice) || 0).toFixed(2)}
                               </span>
                             )}
                          </div>
                      
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full mt-4 btn btn-primary py-2.5 active:scale-95 shadow-sm"
                          >
                            <FiShoppingCart className="mr-2" /> Add to Cart
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    {renderFeatureRow('Brand', (item) => item.brand || 'ShopHub')}
                    {renderFeatureRow('Category', (item) => item.category?.name || 'General')}
                    {renderFeatureRow('Rating', (item) => (
                       <div className="flex items-center">
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < Math.round(item.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-slate-600'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            ({item.reviewCount || 0})
                          </span>
                       </div>
                    ))}
                    {renderFeatureRow('Availability', (item) => (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                      </span>
                    ))}
                    
                    {/* Description */}
                    {renderFeatureRow('Description', (item) => (
                       <p className="text-sm leading-relaxed line-clamp-4">{item.description}</p>
                    ))}
                    
                    {/* Key Features */}
                    {renderFeatureRow('Key Features', (item) => {
                      if (!item.features || item.features.length === 0) return 'N/A';
                      return (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {item.features.slice(0, 4).map((f, i) => <li key={i} className="line-clamp-1">{f}</li>)}
                          {item.features.length > 4 && <li className="text-gray-400 list-none text-xs mt-1">+{item.features.length - 4} more</li>}
                        </ul>
                      );
                    })}

                    {/* Specifications */}
                    {renderFeatureRow('Specifications', (item) => {
                       const specs = [];
                       if (item.sizes && item.sizes.length > 0) specs.push(`Sizes: ${item.sizes.join(', ')}`);
                       if (item.colors && item.colors.length > 0) specs.push(`Colors: ${item.colors.join(', ')}`);
                       
                       if (specs.length === 0) return 'N/A';
                       return (
                         <div className="space-y-1 text-sm">
                           {specs.map((s, i) => <div key={i}>{s}</div>)}
                         </div>
                       );
                    })}
                  </tbody>
                </table>
               </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
