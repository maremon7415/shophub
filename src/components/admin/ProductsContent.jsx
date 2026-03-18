'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiCopy, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [batchActionValue, setBatchActionValue] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    subCategory: '',
    stock: '',
    brand: '',
    sizes: [],
    colors: [],
    tags: [],
    bestSeller: false,
    featured: false,
    newArrival: false,
    images: ['', '', '', ''],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', 10);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error('Restricted by author');
    return;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save product');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (productId) => {
    toast.error('Restricted by author');
    return;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleToggleStatus = async (product) => {
    toast.error('Restricted by author');
    return;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (res.ok) {
        toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}!`);
        fetchProducts();
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleBulkAction = async () => {
    if (!batchActionValue || selectedProductIds.length === 0) return;
    toast.error('Restricted by author');
    return;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const promises = selectedProductIds.map(id => {
        if (batchActionValue === 'delete') {
          return fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        } else if (batchActionValue === 'activate' || batchActionValue === 'deactivate') {
          return fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: batchActionValue === 'activate' }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(`Bulk action completed on ${selectedProductIds.length} products`);
      setSelectedProductIds([]);
      setBatchActionValue('');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleDuplicate = (product) => {
    setEditingProduct(null); // Force create mode
    setFormData({
      ...formData,
      name: `${product.name} (Copy)`,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || '',
      category: product.category?._id || '',
      subCategory: product.subCategory || '',
      stock: product.stock,
      brand: product.brand || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      bestSeller: false,
      featured: false,
      newArrival: false,
      images: product.images || ['', '', '', ''],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      subCategory: '',
      stock: '',
      brand: '',
      sizes: [],
      colors: [],
      tags: [],
      bestSeller: false,
      featured: false,
      newArrival: false,
      images: ['', '', '', ''],
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || '',
      category: product.category?._id || '',
      subCategory: product.subCategory || '',
      stock: product.stock,
      brand: product.brand || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      bestSeller: product.bestSeller || false,
      featured: product.featured || false,
      newArrival: product.newArrival || false,
      images: product.images || ['', '', '', ''],
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </div>
        </div>

        {selectedProductIds.length > 0 && (
          <div className="mb-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedProductIds.length} products selected
            </div>
            <div className="flex items-center gap-3">
              <select
                value={batchActionValue}
                onChange={(e) => setBatchActionValue(e.target.value)}
                className="input py-1.5 text-sm w-48"
              >
                <option value="">Choose bulk action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button 
                onClick={handleBulkAction}
                disabled={!batchActionValue}
                className="btn btn-primary py-1.5 px-4 text-sm disabled:opacity-50 shrink-0"
              >
                Apply
              </button>
              <button 
                onClick={() => setSelectedProductIds([])}
                className="btn btn-outline py-1.5 px-4 text-sm shrink-0"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedProductIds(products.map(p => p._id));
                        else setSelectedProductIds([]);
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                        checked={selectedProductIds.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProductIds([...selectedProductIds, product._id]);
                          else setSelectedProductIds(selectedProductIds.filter(id => id !== product._id));
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.soldCount || 0} sold</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{product.category?.name || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">${(parseFloat(product.price) || 0).toFixed(2)}</span>
                      {parseFloat(product.comparePrice) > parseFloat(product.price) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 line-through">
                          ${(parseFloat(product.comparePrice) || 0).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={product.stock <= 5 ? 'text-red-500 font-medium inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/50' : ''}>
                        {product.stock} {product.stock <= 5 && ' Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`flex items-center gap-1 ${
                          product.isActive ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {product.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        <span className="text-sm">{product.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                          title="Duplicate"
                        >
                          <FiCopy size={18} />
                        </button>
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          title="View"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
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
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === page
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
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
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compare Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sub Category</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URLs</label>
                {formData.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[i] = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      placeholder={`Image URL ${i + 1}`}
                      className="input flex-1"
                    />
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 text-gray-500"
                        disabled={i === 0}
                        onClick={() => {
                          const newImages = [...formData.images];
                          [newImages[i - 1], newImages[i]] = [newImages[i], newImages[i - 1]];
                          setFormData({ ...formData, images: newImages });
                        }}
                      >
                        <FiArrowUp size={14} />
                      </button>
                      <button 
                        type="button"
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 text-gray-500"
                        disabled={i === formData.images.length - 1}
                        onClick={() => {
                          const newImages = [...formData.images];
                          [newImages[i], newImages[i + 1]] = [newImages[i + 1], newImages[i]];
                          setFormData({ ...formData, images: newImages });
                        }}
                      >
                        <FiArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="mr-2"
                  />
                  Best Seller
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="mr-2"
                  />
                  New Arrival
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
