'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiX, FiRepeat } from 'react-icons/fi';
import { useCompareStore } from '@/store';
import { usePathname } from 'next/navigation';

export default function CompareBar() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearCompare } = useCompareStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0 || pathname === '/compare') return null;

  return (
    <div className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] transform transition-transform animate-slide-up">
      <div className="container py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h3 className="font-semibold hidden lg:block text-gray-900 dark:text-white">Compare ({items.length}/4)</h3>
            <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex-1 sm:flex-none">
              {items.map((item) => (
                <div key={item._id} className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border border-gray-200 dark:border-slate-700 bg-gray-50 flex items-center justify-center group overflow-hidden">
                  <img src={item.images?.[0] || item.image || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeItem(item._id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {[...Array(4 - items.length)].map((_, i) => (
                <div key={`empty-${i}`} className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center opacity-50">
                   <FiRepeat className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button
                onClick={clearCompare}
                className="btn btn-outline py-2 px-4 flex-1 sm:flex-none text-sm"
             >
                Clear All
             </button>
             <Link
               href="/compare"
               className={`btn py-2 px-6 flex-1 sm:flex-none text-sm shadow-md whitespace-nowrap ${items.length > 1 ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed hidden sm:flex'}`}
               onClick={(e) => items.length < 2 && e.preventDefault()}
             >
               Compare ({items.length})
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
