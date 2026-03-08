'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BannersContent() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    linkText: 'Shop Now',
    position: 'home',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, [pagination.page, search]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', 10);

      const res = await fetch(`/api/admin/banners?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBanners(data.banners || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error('Restricted by author');
    return;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const bannerData = {
        ...formData,
        order: parseInt(formData.order) || 0,
      };

      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner._id}`
        : '/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (res.ok) {
        toast.success(editingBanner ? 'Banner updated!' : 'Banner created!');
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save banner');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (bannerId) => {
    toast.error('Restricted by author');
    return;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Banner deleted!');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleToggleStatus = async (banner) => {
    toast.error('Restricted by author');
    return;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (res.ok) {
        toast.success(`Banner ${banner.isActive ? 'deactivated' : 'activated'}!`);
        fetchBanners();
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      linkText: 'Shop Now',
      position: 'home',
      order: 0,
      isActive: true,
    });
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      linkText: banner.linkText || 'Shop Now',
      position: banner.position || 'home',
      order: banner.order || 0,
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Banners</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage promotional banners</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingBanner(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" /> Add Banner
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <FiImage className="mx-auto text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No banners found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-100 dark:bg-slate-800">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiImage size={40} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      banner.isActive ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg dark:text-white">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-slate-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{banner.position}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`p-2 rounded-lg ${banner.isActive ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                      >
                        {banner.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Summer Sale"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input"
                  placeholder="Up to 50% off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  placeholder="https://example.com/banner.jpg"
                  required
                />
                {formData.image && (
                  <div className="mt-2 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="input"
                  placeholder="https://example.com/products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                  className="input"
                  placeholder="Shop Now"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                  >
                    <option value="home">Home</option>
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="input"
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
                  {editingBanner ? 'Update' : 'Create'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
