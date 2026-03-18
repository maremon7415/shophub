'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiChevronDown, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiArrowUp } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const trustBadges = [
    { icon: FiShield, title: 'Secure Checkout', desc: '100% protected payments' },
    { icon: FiTruck, title: 'Fast Shipping', desc: 'Free delivery over $50' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated help center' },
  ];

  return (
    <footer className="bg-primary text-white pt-16 pb-8 relative mt-auto">
      <div className="container">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/10">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-accent/20 flex items-center justify-center text-accent mb-4 transition-colors duration-300 group-hover:scale-110">
                <badge.icon size={24} />
              </div>
              <h5 className="font-semibold text-sm mb-1">{badge.title}</h5>
              <p className="text-gray-400 text-xs">{badge.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 md:gap-12 mb-12">
          <div>
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold font-display">
                Shop<span className="text-accent">Hub</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              Your premier destination for premium products. Quality assured, price guaranteed.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>

          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button onClick={() => toggleSection('links')} className="flex items-center justify-between w-full md:cursor-default md:pointer-events-none mb-2 md:mb-6">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <FiChevronDown className={`md:hidden transition-transform ${openSection === 'links' ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-3 overflow-hidden transition-all duration-300 ${openSection === 'links' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/collections" className="text-gray-400 hover:text-accent transition-colors">Shop All</Link></li>
              <li><Link href="/collections?bestSeller=true" className="text-gray-400 hover:text-accent transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections?newArrival=true" className="text-gray-400 hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections?featured=true" className="text-gray-400 hover:text-accent transition-colors">Featured Products</Link></li>
            </ul>
          </div>

          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button onClick={() => toggleSection('service')} className="flex items-center justify-between w-full md:cursor-default md:pointer-events-none mb-2 md:mb-6">
              <h4 className="text-lg font-semibold">Customer Service</h4>
              <FiChevronDown className={`md:hidden transition-transform ${openSection === 'service' ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-3 overflow-hidden transition-all duration-300 ${openSection === 'service' ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/faq" className="text-gray-400 hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-accent transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-accent transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <button onClick={() => toggleSection('contact')} className="flex items-center justify-between w-full md:cursor-default md:pointer-events-none mb-2 md:mb-6">
              <h4 className="text-lg font-semibold">Contact Us</h4>
              <FiChevronDown className={`md:hidden transition-transform ${openSection === 'contact' ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-4 overflow-hidden transition-all duration-300 ${openSection === 'contact' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-accent mt-1" />
                <span className="text-gray-400">123 Commerce Street, Business City, BC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-accent" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-accent transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-accent" />
                <a href="mailto:support@shophub.com" className="text-gray-400 hover:text-accent transition-colors">support@shophub.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} ShopHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-gray-400">
              <FaCcVisa className="h-8 w-auto hover:text-white transition-colors cursor-pointer" />
              <FaCcMastercard className="h-8 w-auto hover:text-white transition-colors cursor-pointer" />
              <FaCcAmex className="h-8 w-auto hover:text-white transition-colors cursor-pointer" />
              <FaCcPaypal className="h-8 w-auto hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-[80px] lg:bottom-6 right-6 w-12 h-12 bg-accent hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-40 ${
          showBackToTop ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'
        }`}
        aria-label="Back to top"
      >
        <FiArrowUp size={24} />
      </button>
    </footer>
  );
}
