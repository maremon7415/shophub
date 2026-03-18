'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiCheckCircle, FiXCircle, FiStar, FiFilter, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReviewsContent() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(`Review ${newStatus}`);
        fetchReviews(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to update review status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        toast.success('Review deleted successfully');
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete review');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold dark:text-white">Review Moderation</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${statusFilter === 'all' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => { setStatusFilter('pending'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
            >
              Pending
            </button>
            <button
              onClick={() => { setStatusFilter('approved'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
            >
              Approved
            </button>
            <button
              onClick={() => { setStatusFilter('rejected'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
            >
              Rejected
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-700 h-24 rounded-xl w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
            <FiStar className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reviews found</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no reviews matching the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-4 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                  <th className="pb-4 font-semibold text-gray-600 dark:text-gray-300">Review & Rating</th>
                  <th className="pb-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                  <th className="pb-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="pb-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4">
                      {review.productId ? (
                        <div className="flex items-center gap-3">
                          <img src={review.productId.image || ''} alt="" className="w-12 h-12 rounded object-cover border dark:border-slate-700" />
                          <span className="font-medium inline-block max-w-[150px] truncate dark:text-white" title={review.productId.name}>{review.productId.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown Product</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex text-yellow-400 mb-1 text-sm">
                        {[...Array(5)].map((_, i) => <FiStar key={i} className={i < review.rating ? 'fill-current' : ''} />)}
                      </div>
                      <p className="font-semibold text-sm mb-1 line-clamp-1 dark:text-white" title={review.title}>{review.title}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 max-w-sm" title={review.comment}>{review.comment}</p>
                    </td>
                    <td className="py-4">
                      {review.userId ? (
                        <div>
                          <p className="font-medium text-sm dark:text-white">{review.userId.name}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[120px]">{review.userId.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Deleted User</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                            className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                            title="Approve"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                            className="p-2 text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 transition-colors"
                            title="Reject"
                          >
                            <FiXCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                          title="Delete Permanently"
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
        
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline py-1.5 px-3 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline py-1.5 px-3 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
