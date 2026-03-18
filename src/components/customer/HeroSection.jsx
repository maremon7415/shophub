'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiChevronLeft, FiArrowRight, FiShoppingBag, FiStar } from 'react-icons/fi';

export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Throttle or requestAnimationFrame for better performance
      window.requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/banners?position=home&activeOnly=true')
      .then((res) => res.json())
      .then((data) => {
        setBanners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load banners:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const defaultBanners = [
    {
      _id: '1',
      title: 'Summer Collection 2024',
      subtitle: 'New Arrivals',
      description: 'Discover the latest trends and exclusive deals on premium products. Upgrade your style today!',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920',
      link: '/collections?newArrival=true',
      linkText: 'Shop Now',
      discount: 'Up to 50% Off',
    },
    {
      _id: '2',
      title: 'Premium Quality',
      subtitle: 'Best Sellers',
      description: 'Handpicked favorites from our collection. Premium quality at unbeatable prices.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920',
      link: '/collections?featured=true',
      linkText: 'Explore Now',
      discount: 'Free Shipping',
    },
    {
      _id: '3',
      title: 'Electronics Sale',
      subtitle: 'Tech Deals',
      description: 'Latest gadgets and electronics at discounted prices. Limited time offer!',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920',
      link: '/collections?category=electronics',
      linkText: 'Browse Deals',
      discount: 'Flat 30% Off',
    },
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  if (loading) {
    return (
      <section className="relative h-[85vh] min-h-[600px] bg-gray-100 dark:bg-slate-900">
        <div className="skeleton h-full w-full absolute inset-0" />
      </section>
    );
  }

  return (
    <section
      className="relative h-[85vh] min-h-[600px] overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-full">
        {displayBanners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
          >
            <div className="h-full relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-linear transform-gpu ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                style={{ 
                  backgroundImage: `url(${banner.image})`,
                  transform: `translateY(${scrollY * 0.4}px) scale(${index === currentSlide ? 1.05 : 1})`,
                }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/30" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

              <div className="container h-full flex items-center relative z-10 pt-20">
                <div className="max-w-2xl text-white">
                  {banner.discount && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-bold mb-6 animate-slide-up shadow-lg shadow-amber-500/20">
                      <FiStar className="fill-current animate-pulse" size={14} />
                      {banner.discount}
                    </div>
                  )}

                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-medium tracking-wider uppercase mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    {banner.subtitle}
                  </span>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight drop-shadow-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {banner.title}
                  </h1>

                  <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed font-light max-w-lg animate-slide-up" style={{ animationDelay: '300ms' }}>
                    {banner.description}
                  </p>

                  <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <Link
                      href={banner.link || '/collections'}
                      className="group relative inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="absolute inset-0 w-full h-full bg-linear-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center">
                        <FiShoppingBag className="mr-2" size={20} />
                        {banner.linkText || 'Shop Now'}
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                      </span>
                    </Link>

                    <Link
                      href="/collections"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-medium rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg"
                    >
                      <span className="relative flex items-center">
                        View All Products
                        <FiChevronRight className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={20} />
                      </span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-8 mt-10 pt-6 border-t border-white/20 animate-slide-up" style={{ animationDelay: '500ms' }}>
                    <div className="text-center group cursor-default">
                      <p className="text-2xl font-bold text-amber-400 group-hover:scale-110 transition-transform duration-300">10K+</p>
                      <p className="text-sm text-gray-300">Products</p>
                    </div>
                    <div className="text-center group cursor-default">
                      <p className="text-2xl font-bold text-amber-400 group-hover:scale-110 transition-transform duration-300">50K+</p>
                      <p className="text-sm text-gray-300">Customers</p>
                    </div>
                    <div className="text-center group cursor-default">
                      <p className="text-2xl font-bold text-amber-400 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-1">4.9<FiStar className="fill-current" size={16} /></p>
                      <p className="text-sm text-gray-300">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} md:opacity-100 md:translate-x-0`}
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} md:opacity-100 md:translate-x-0`}
          >
            <FiChevronRight size={24} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/50 w-2 hover:bg-white/80'
                    }`}
                >
                  {index === currentSlide && (
                    <span className="absolute inset-0 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
    </section>
  );
}
