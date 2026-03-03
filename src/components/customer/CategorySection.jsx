'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories?activeOnly=true&hierarchical=false')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-xl dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const defaultCategories = [
    { _id: '1', name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
    { _id: '2', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
    { _id: '3', name: 'Home & Garden', slug: 'home-garden', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
    { _id: '4', name: 'Sports', slug: 'sports', image: 'https://images.unsplash.com/photo-1461896836934- voices-cc0ed63a-9317?w=400' },
    { _id: '5', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
    { _id: '6', name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-primary dark:text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our extensive collection across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {displayCategories.map((category, index) => (
            <Link
              key={category._id}
              href={`/collections?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-square"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
