'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiMessageSquare, FiImage, FiX } from 'react-icons/fi';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId, initialData }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [stats, setStats] = useState(initialData?.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  
  const [loading, setLoading] = useState(!initialData);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] // To be implemented with Cloudinary later
  });
  
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!initialData) {
      fetchReviews();
    }
  }, [productId, sortBy, page, initialData]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&sort=${sortBy}&page=${page}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(page === 1 ? data.reviews : [...reviews, ...data.reviews]);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Review submitted successfully (pending approval)');
        setShowForm(false);
        setFormData({ rating: 5, title: '', comment: '', images: [] });
        // Optionally fetch reviews again or just wait for status approval
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      if (res.ok) {
        // Update local state to reflect the vote
        setReviews(reviews.map(r => {
          if (r._id === reviewId) {
            const isHelpful = r.helpful.includes(user.id);
            return {
              ...r,
              helpful: isHelpful ? r.helpful.filter(id => id !== user.id) : [...r.helpful, user.id]
            };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Failed to register vote:', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={i < rating ? 'fill-current' : ''} />
        ))}
      </div>
    );
  };
  
  const renderDistributionBar = (star, count, total) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="w-12">{star} stars</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
        </div>
        <span className="w-8 text-right">{count}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="md:w-1/3">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Customer Reviews</h2>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-5xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</h3>
            <div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="text-gray-500 text-sm mt-1">Based on {stats.totalReviews} reviews</p>
            </div>
          </div>
          <div>
            {[5, 4, 3, 2, 1].map(star => renderDistributionBar(star, stats.ratingDistribution[star] || 0, stats.totalReviews))}
          </div>
          <div className="mt-8">
            <h4 className="font-medium mb-2 dark:text-white">Share your thoughts</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">If you've used this product, share your thoughts with other customers</p>
            <button 
              onClick={() => {
                if(!user) return router.push('/login');
                setShowForm(!showForm);
              }}
              className="btn btn-outline w-full"
            >
              Write a Review
            </button>
          </div>
        </div>

        <div className="md:w-2/3 w-full">
          {showForm && (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-6 mb-8 relative animate-slide-up">
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Write Your Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`text-2xl focus:outline-none ${formData.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-slate-600'}`}
                      >
                        <FiStar className={formData.rating >= star ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summary of your experience"
                    className="input"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Content</label>
                  <textarea
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="input min-h-[120px]"
                    maxLength={1000}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 border-b dark:border-slate-700 pb-4">
            <h3 className="font-semibold dark:text-white">{stats.totalReviews} Reviews</h3>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="text-sm bg-transparent border-none text-gray-600 dark:text-gray-400 focus:ring-0 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          <div className="space-y-8">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 dark:border-slate-700 pb-8 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                    {review.user?.image ? (
                      <img src={review.user.image} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-medium text-lg">{review.user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex sm:items-center flex-col sm:flex-row gap-2 sm:gap-4 mb-2">
                      <span className="font-semibold dark:text-white">{review.user?.name || 'Anonymous User'}</span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Verified Buyer
                        </span>
                      )}
                      <span className="text-sm text-gray-500 sm:ml-auto">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                    <h4 className="font-medium mt-3 mb-2 dark:text-white">{review.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{review.comment}</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <button 
                        onClick={() => handleHelpful(review._id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          review.helpful?.includes(user?.id) 
                            ? 'text-accent' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        <FiThumbsUp className={review.helpful?.includes(user?.id) ? 'fill-current' : ''} />
                        Helpful ({review.helpful?.length || 0})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {reviews.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiMessageSquare className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews match your criteria.</p>
              </div>
            )}

            {page < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  {loading ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
