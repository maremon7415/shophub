'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiArrowUpRight, FiArrowRight, FiActivity } from 'react-icons/fi';
import { useAuthStore } from '@/store';

const StatCard = ({ label, value, icon: Icon, color, change, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...(data || []).map(d => d.revenue), 1);
  
  return (
    <div className="h-64 flex items-end justify-between gap-2 px-4">
      {(data || []).map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-md transition-all duration-500 hover:from-primary hover:to-primary/90"
            style={{ height: `${(item.revenue / maxValue) * 200}px` }}
          />
          <span className="text-xs text-gray-400 mt-2">{item.day}</span>
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
            <div key={i} className="bg-white rounded-2xl p-6">
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
    {
      label: 'Total Users',
      value: stats?.stats?.totalUsers?.toLocaleString() || '0',
      icon: FiUsers,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Total Products',
      value: stats?.stats?.totalProducts?.toLocaleString() || '0',
      icon: FiPackage,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: '+5%',
      trend: 'up',
    },
    {
      label: 'Total Orders',
      value: stats?.stats?.totalOrders?.toLocaleString() || '0',
      icon: FiShoppingCart,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      change: '+18%',
      trend: 'up',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      change: '+8%',
      trend: 'up',
    },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: FiPackage, color: 'bg-blue-50 text-blue-600' },
    { label: 'Manage Orders', href: '/admin/orders', icon: FiShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Create Coupon', href: '/admin/coupons', icon: FiActivity, color: 'bg-purple-50 text-purple-600' },
    { label: 'View Users', href: '/admin/users', icon: FiUsers, color: 'bg-amber-50 text-amber-600' },
  ];

  const revenueData = [
    { day: 'Mon', revenue: 1200 },
    { day: 'Tue', revenue: 1800 },
    { day: 'Wed', revenue: 1400 },
    { day: 'Thu', revenue: 2100 },
    { day: 'Fri', revenue: 2800 },
    { day: 'Sat', revenue: 3200 },
    { day: 'Sun', revenue: 2400 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="input py-2 px-4 bg-white border-gray-200 w-40"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Weekly revenue breakdown</p>
            </div>
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <FiTrendingUp size={16} />
              +12.5%
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon size={20} />
                </div>
                <span className="font-medium text-gray-700 flex-1">{action.label}</span>
                <FiArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiShoppingCart className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.userId?.name || 'Guest'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${order.total?.toFixed(2)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingCart className="mx-auto mb-2 text-2xl opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Store Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-amber-800">{stats?.stats?.lowStockProducts || 0} Low Stock Products</p>
                <p className="text-sm text-amber-600 mt-1">Products running low on inventory</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-blue-800">{stats?.stats?.pendingOrders || 0} Pending Orders</p>
                <p className="text-sm text-blue-600 mt-1">Orders awaiting processing</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiUsers className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-green-800">{stats?.stats?.totalUsers || 0} Total Customers</p>
                <p className="text-sm text-green-600 mt-1">Registered on your store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
