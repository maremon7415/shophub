'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    isActive: true,
    order: 0,
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch('/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCategory 
          ? { id: editingCategory._id, ...formData }
          : formData
        ),
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Category updated!' : 'Category created!');
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save category');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Category deleted!');
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (res.ok) {
        toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}!`);
        fetchCategories();
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      parentCategory: '',
      isActive: true,
      order: 0,
    });
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory?._id || '',
      isActive: category.isActive,
      order: category.order || 0,
    });
    setShowModal(true);
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const buildHierarchy = (cats, parentId = null) => {
    return cats
      .filter(cat => {
        const parentIdStr = parentId?._id?.toString() || parentId?.toString() || null;
        const catParentIdStr = cat.parentCategory?._id?.toString() || cat.parentCategory?.toString() || null;
        return catParentIdStr === parentIdStr;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const renderCategoryRow = (category, level = 0) => {
    const hasChildren = categories.some(cat => {
      const catParentId = cat.parentCategory?._id?.toString() || cat.parentCategory?.toString();
      return catParentId === category._id.toString();
    });
    
    const isExpanded = expandedCategories[category._id];
    const children = buildHierarchy(categories, category._id);

    return (
      <React.Fragment key={category._id}>
        <tr className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <td className="py-3 px-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded flex items-center justify-center text-gray-400">
                  {category.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
            </div>
          </td>
          <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
            {category.parentCategory?.name || '-'}
          </td>
          <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
            {category.slug}
          </td>
          <td className="py-3 px-4">
            <button
              onClick={() => handleToggleStatus(category)}
              className={`flex items-center gap-1 ${
                category.isActive ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              {category.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
              <span className="text-sm">{category.isActive ? 'Active' : 'Inactive'}</span>
            </button>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(category)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const rootCategories = buildHierarchy(categories, null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Parent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Slug</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rootCategories.map(category => renderCategoryRow(category))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Category (Optional)</label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="input"
                >
                  <option value="">No Parent</option>
                  {categories
                    .filter(c => c._id !== editingCategory?._id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="input"
                />
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
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
