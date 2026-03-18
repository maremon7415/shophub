'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiArrowUpRight, FiArrowRight, FiActivity } from 'react-icons/fi';
import { useAuthStore } from '@/store';

const StatCard = ({ label, value, icon: Icon, color, change, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <FiArrowUpRight size={16} /> : <FiTrendingDown size={16} />}
          {change}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...(data || []).map(d => d.revenue), 1);
  const isDark = true;
  
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No revenue data for this period</div>;
  }
  
  return (
    <div className="h-64 flex items-end justify-between gap-2 px-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center group relative">
          <div 
            className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 relative ${isDark ? 'bg-gradient-to-t from-amber-600 to-amber-500' : 'bg-gradient-to-t from-primary/80 to-primary'}`}
            style={{ height: `${(item.revenue / maxValue) * 200}px`, minHeight: '4px' }}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
              ${item.revenue.toFixed(2)}
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">{item.day}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const { token } = useAuthStore();

  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      fetchDashboardData(state?.token);
    }
  }, [period]);

  const fetchDashboardData = async (authToken) => {
    try {
      const res = await fetch(`/api/admin/dashboard?period=${period}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <div className="skeleton h-14 w-14 rounded-xl mb-4" />
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.totalUsers?.toLocaleString() || '0', icon: FiUsers, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Total Products', value: stats?.stats?.totalProducts?.toLocaleString() || '0', icon: FiPackage, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { label: 'Total Orders', value: stats?.stats?.totalOrders?.toLocaleString() || '0', icon: FiShoppingCart, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'Total Revenue', value: `$${(stats?.stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FiDollarSign, color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: FiPackage, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Manage Orders', href: '/admin/orders', icon: FiShoppingCart, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Create Coupon', href: '/admin/coupons', icon: FiActivity, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { label: 'View Users', href: '/admin/users', icon: FiUsers, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  ];

  const revenueData = stats?.salesData?.map(d => {
    const date = new Date(d._id);
    // Add timezone offset to fix UTC date parsing issues showing day before
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return {
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: d.total
    };
  }) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="input py-2 px-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 w-40"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue for selected period</p>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon size={20} />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{action.label}</span>
                <FiArrowRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-accent text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <FiShoppingCart className="text-accent" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.userId?.name || 'Guest'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white">${(parseFloat(order.total) || 0).toFixed(2)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                    order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                    order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiShoppingCart className="mx-auto mb-2 text-2xl opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Store Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">{stats?.stats?.lowStockProducts || 0} Low Stock Products</p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Products running low on inventory</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300">{stats?.stats?.pendingOrders || 0} Pending Orders</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Orders awaiting processing</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <FiUsers className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">{stats?.stats?.totalUsers || 0} Total Customers</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Registered on your store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {stats?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-slate-600">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiPackage className="w-full h-full p-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white truncate" title={product.name}>{product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.totalSold} sold in this period</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-accent">${(product.totalRevenue || 0).toFixed(2)}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-400">No sales data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Sales by Category</h2>
          <div className="space-y-5">
            {stats?.categoryStats?.slice(0, 5).map((cat, index) => {
              const maxSold = Math.max(...stats.categoryStats.map(c => c.totalSold), 1);
              const percentage = (cat.totalSold / maxSold) * 100;
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-emerald-500'];
              
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{cat.category.name}</span>
                    <span className="text-gray-500">{cat.totalSold} items</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${colors[index % colors.length]}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center py-8 text-gray-400">No category data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
