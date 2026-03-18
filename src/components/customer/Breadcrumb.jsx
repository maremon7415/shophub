'use client';

import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link 
        href="/" 
        className="hover:text-accent dark:hover:text-accent transition-colors"
      >
        Home
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <span key={index} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {isLast || !item.href ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-accent dark:hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
