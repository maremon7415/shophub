'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiMail, FiDollarSign, FiShoppingBag, FiTruck, FiLock, FiGlobe, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsContent() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'ShopHub',
    storeEmail: 'admin@shophub.com',
    storePhone: '+1 234 567 890',
    storeAddress: '',
    currency: 'USD',
    taxRate: 0,
    freeShippingThreshold: 100,
    shippingCost: 10,
    minimumOrderAmount: 0,
    orderConfirmationEmail: true,
    orderStatusEmail: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          <FiSave className="mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Store Email</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Store Phone</label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="input"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Store Address</label>
                <textarea
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="123 Store Street, City, State, ZIP"
                />
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Order Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.minimumOrderAmount}
                    onChange={(e) => setSettings({ ...settings, minimumOrderAmount: parseFloat(e.target.value) })}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 to allow any order amount</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Shipping Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Free Shipping Threshold</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.shippingCost}
                    onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Order Confirmation Email</p>
                    <p className="text-sm text-gray-500">Send email when order is placed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.orderConfirmationEmail}
                    onChange={(e) => setSettings({ ...settings, orderConfirmationEmail: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Order Status Updates</p>
                    <p className="text-sm text-gray-500">Send email when order status changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.orderStatusEmail}
                    onChange={(e) => setSettings({ ...settings, orderStatusEmail: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlert}
                    onChange={(e) => setSettings({ ...settings, lowStockAlert: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                </label>

                {settings.lowStockAlert && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                      className="input w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
