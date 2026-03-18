'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiStar, FiActivity, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', 12);
      if (search) params.append('search', search);

      const res = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    toast.error('Restricted by author');
    return;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUser._id,
          name: editData.name,
          phone: editData.phone,
          role: editData.role,
          isActive: editData.isActive,
        }),
      });

      if (res.ok) {
        toast.success('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
    });
    setShowEditModal(true);
  };

  const getUserStats = async (userId) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const authToken = authStorage ? JSON.parse(authStorage).state.token : '';
      
      const res = await fetch(`/api/admin/users/${userId}/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage registered users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {users.length} of {pagination.total} users
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-20" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <FiUser className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                        setSelectedUser(user);
                        setUserStats(null);
                        getUserStats(user._id).then(stats => setUserStats(stats));
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${selectedUser?._id === user._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-accent font-semibold text-lg">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${
                          user.role === 'admin' ? 'badge-error' : 'badge-info'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`badge ${
                          user.isActive !== false ? 'badge-success' : 'badge-warning'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
        </div>

        <div className="bg-white rounded-xl shadow-card p-6 h-fit sticky top-24">
          {selectedUser ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">User Details</h3>
                <button
                  onClick={() => openEditModal(selectedUser)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <FiEdit size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">
                      {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FiMail className="text-gray-400" />
                    <a href={`mailto:${selectedUser.email}`} className="hover:text-blue-500 hover:underline transition-colors">{selectedUser.email}</a>
                  </div>
                  
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <FiPhone className="text-gray-400" />
                      <a href={`tel:${selectedUser.phone}`} className="hover:text-blue-500 hover:underline transition-colors">{selectedUser.phone}</a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <FiCalendar className="text-gray-400" />
                    <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t dark:border-slate-700 pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className={`badge ${
                      selectedUser.role === 'admin' ? 'badge-error' : 'badge-info'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`badge ${
                      selectedUser.isActive !== false ? 'badge-success' : 'badge-warning'
                    }`}>
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* User Stats & Activity */}
                {userStats ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <FiShoppingBag size={14} />
                          <span className="text-xs uppercase font-semibold">Orders</span>
                        </div>
                        <p className="text-2xl font-bold">{userStats.totalOrders}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                          <FiDollarSign size={14} />
                          <span className="text-xs uppercase font-semibold">Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold">${userStats.totalSpent}</p>
                      </div>
                    </div>

                    {userStats.recentOrders?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FiActivity className="text-gray-400" />
                          <h4 className="font-semibold text-sm">Recent Orders</h4>
                        </div>
                        <div className="space-y-3">
                          {userStats.recentOrders.map(order => (
                            <div key={order._id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg text-sm">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${order.total}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {userStats.recentReviews?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FiStar className="text-gray-400" />
                          <h4 className="font-semibold text-sm">Recent Reviews</h4>
                        </div>
                        <div className="space-y-3">
                          {userStats.recentReviews.map(review => (
                            <div key={review._id} className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex text-amber-400 text-xs">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                                  ))}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                  review.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  review.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {review.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 flex flex-col items-center justify-center animate-pulse">
                     <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                     <span className="text-sm text-gray-500">Loading activity...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiUser className="mx-auto mb-2 text-3xl" />
              <p>Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Edit User</h2>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  disabled
                  className="input bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  className="input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                  className="mr-2"
                />
                Active
              </label>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
