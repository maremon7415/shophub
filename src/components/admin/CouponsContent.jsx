'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CouponsContent() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountValue: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, [pagination.page, search]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', 10);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/coupons?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCoupons(data.coupons || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const couponData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscountValue: formData.maxDiscountValue ? parseFloat(formData.maxDiscountValue) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: parseInt(formData.perUserLimit) || 1,
        startDate: new Date(formData.startDate),
        expiryDate: new Date(formData.expiryDate),
      };

      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon._id}`
        : '/api/admin/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      if (res.ok) {
        toast.success(editingCoupon ? 'Coupon updated!' : 'Coupon created!');
        setShowModal(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Coupon deleted!');
        fetchCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (res.ok) {
        toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}!`);
        fetchCoupons();
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxDiscountValue: '',
      usageLimit: '',
      perUserLimit: 1,
      startDate: '',
      expiryDate: '',
      isActive: true,
    });
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscountValue: coupon.maxDiscountValue || '',
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || 1,
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coupons</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage discount coupons</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" /> Add Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {coupons.length} of {pagination.total} coupons
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Usage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Valid Until</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-800 dark:text-white">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `$${coupon.discountValue}`
                        }
                      </span>
                      {coupon.maxDiscountValue && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Max: ${coupon.maxDiscountValue}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={coupon.usageLimit && coupon.usedCount >= coupon.usageLimit ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}>
                        {coupon.usedCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={isExpired(coupon.expiryDate) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                      {isExpired(coupon.expiryDate) && (
                        <span className="ml-2 badge badge-error">Expired</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`flex items-center gap-1 ${
                          coupon.isActive ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {coupon.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        <span className="text-sm">{coupon.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center mt-6 pb-6">
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === page
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input font-mono"
                  placeholder="SAVE20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="20% off on all products"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="input"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscountValue}
                    onChange={(e) => setFormData({ ...formData, maxDiscountValue: e.target.value })}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="input"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                Active
              </label>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
