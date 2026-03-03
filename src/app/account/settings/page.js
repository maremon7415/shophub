'use client';

import { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiLock, FiGlobe, FiMoon, FiSun, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: true,
    darkMode: false,
    language: 'en',
    currency: 'USD',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setSettings(prev => ({ ...prev, darkMode: true }));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy', icon: FiLock },
    { id: 'preferences', label: 'Preferences', icon: FiGlobe },
  ];

  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-heading">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your preferences and account settings</p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex whitespace-nowrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">Email Notifications</h3>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="font-medium dark:text-white">Order Updates</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your order status changes</p>
                </div>
                <div 
                  onClick={() => handleToggle('orderUpdates')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.orderUpdates ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.orderUpdates ? 'translate-x-6' : ''}`} />
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="font-medium dark:text-white">Promotional Emails</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive offers and promotions</p>
                </div>
                <div 
                  onClick={() => handleToggle('promotionalEmails')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.promotionalEmails ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.promotionalEmails ? 'translate-x-6' : ''}`} />
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="font-medium dark:text-white">Newsletter</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subscribe to our newsletter</p>
                </div>
                <div 
                  onClick={() => handleToggle('newsletter')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.newsletter ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.newsletter ? 'translate-x-6' : ''}`} />
                </div>
              </label>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">Privacy Settings</h3>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your account data is secure. We never share your personal information with third parties.
                </p>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="font-medium dark:text-white">Profile Visibility</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to see your profile</p>
                </div>
                <div 
                  onClick={() => handleToggle('profileVisibility')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.profileVisibility ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.profileVisibility ? 'translate-x-6' : ''}`} />
                </div>
              </label>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">Display Preferences</h3>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <FiMoon size={20} className="text-blue-400" /> : <FiSun size={20} className="text-amber-500" />}
                  <div>
                    <p className="font-medium dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark">Switch between light and dark theme:text-gray-400</p>
                  </div>
                </div>
                <div 
                  onClick={() => handleToggle('darkMode')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`} />
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
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
          )}

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4 border-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
