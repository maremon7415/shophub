'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPackage, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, router]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-600 bg-green-50 dark:bg-green-900/30';
      case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/30';
      case 'shipped': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
      default: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      
      <main className="flex-1 container pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">My Orders</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-32 rounded-xl"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link href="/collections" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
                <div className="flex flex-col sm:flex-row justify-between border-b dark:border-slate-700 pb-4 mb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex sm:flex-col justify-between sm:items-end sm:gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-lg dark:text-white">${order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100 dark:bg-slate-700" />
                      <div className="flex-1">
                        <Link href={`/product/${item.slug || ''}`} className="font-semibold text-gray-800 dark:text-white hover:text-accent line-clamp-1">{item.name}</Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {parseInt(item.quantity, 10) || 1}
                          {item.size && <span className="ml-2">Size: {item.size}</span>}
                          {item.color && <span className="ml-2">Color: {item.color}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Link href={`/orders/${order.orderNumber}`} className="btn btn-outline flex items-center gap-2">
                    View Details <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
