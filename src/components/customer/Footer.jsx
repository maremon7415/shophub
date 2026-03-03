'use client';

import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/collections" className="text-gray-400 hover:text-accent transition-colors">Shop All</Link></li>
              <li><Link href="/collections?bestSeller=true" className="text-gray-400 hover:text-accent transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections?newArrival=true" className="text-gray-400 hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections?featured=true" className="text-gray-400 hover:text-accent transition-colors">Featured Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-gray-400 hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-accent transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-accent transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
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
    </footer>
  );
}
