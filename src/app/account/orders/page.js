'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPackage, FiEye, FiClock, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import { useAuthStore } from '@/store';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const authToken = authStorage ? JSON.parse(authStorage).state?.token : token;

      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-heading">My Orders</h1>
        <p className="text-gray-500 dark:text-gray-400">Track and manage your orders</p>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((status) => (
              <button
                key={status.id}
                onClick={() => setFilter(status.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === status.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-40 rounded-xl" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-4xl text-gray-300 dark:text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 dark:text-white">No orders found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet</p>
              <Link href="/collections" className="btn btn-primary inline-flex items-center gap-2">
                <FiShoppingBag size={18} />
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order._id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:border-amber-300 dark:hover:border-amber-500 transition-all hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg dark:text-white">{order.orderNumber}</h3>
                        <span className={`badge ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-amber-600 dark:text-amber-400">${order.total?.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                    {statusSteps.map((step, index) => {
                      const currentIndex = statusSteps.indexOf(order.status);
                      const isCompleted = currentIndex >= index;
                      const isCurrent = currentIndex === index;
                      
                      return (
                        <div key={step} className="flex items-center">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                          }`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isCompleted ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-600'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </span>
                            <span className="capitalize hidden sm:inline">{step}</span>
                          </div>
                          {step !== 'delivered' && (
                            <FiChevronRight className="mx-1 text-gray-300 dark:text-gray-600" size={14} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2 overflow-x-auto">
                      {order.items?.slice(0, 4).map((item, index) => (
                        <img
                          key={index}
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      ))}
                      {order.items?.length > 4 && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="btn btn-outline btn-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <FiEye size={16} />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Link>
                  </div>

                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-medium">Tracking:</span> {order.trackingNumber} ({order.carrier})
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
