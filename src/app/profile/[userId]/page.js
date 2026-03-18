'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiInstagram, FiTwitter, FiFacebook, FiCalendar, FiMapPin, FiStar, FiUser, FiActivity } from 'react-icons/fi';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.userId}/public`);
        const data = await res.json();
        
        if (res.ok) {
          setProfile(data.user);
          setReviews(data.reviews);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('An error occurred while fetching the profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="container max-w-4xl pt-24 pb-12">
          <div className="animate-pulse space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="w-32 h-32 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <FiUser className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Unavailable</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{error || 'This user profile could not be found or is set to private.'}</p>
            <Link href="/" className="btn btn-primary w-full">Back to Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors">
      <Navbar />
      
      {/* Profile Header Block */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800/50 pt-28 pb-12 shadow-sm transition-colors">
        <div className="container max-w-4xl text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-gray-100 dark:bg-slate-700 shrink-0">
                {profile.profileUrl || profile.image ? (
                  <img src={profile.profileUrl || profile.image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent text-white text-5xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 md:pt-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">{profile.name}</h1>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                  <FiCalendar /> Member since {new Date(profile.memberSince).getFullYear()}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                  <FiActivity /> {reviews.length} Reviews Written
                </span>
              </div>

              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto md:mx-0 py-2">
                  {profile.bio}
                </p>
              )}

              {/* Social Links */}
              {profile.socialLinks && (profile.socialLinks.instagram || profile.socialLinks.twitter || profile.socialLinks.facebook) && (
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                  {profile.socialLinks.instagram && (
                    <a href={`https://instagram.com/${profile.socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 dark:hover:text-pink-400 transition-colors">
                      <FiInstagram size={18} />
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={`https://twitter.com/${profile.socialLinks.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-500 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 dark:hover:text-blue-400 transition-colors">
                      <FiTwitter size={18} />
                    </a>
                  )}
                  {profile.socialLinks.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 dark:hover:text-blue-500 transition-colors">
                      <FiFacebook size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-12">
        <h3 className="text-2xl font-bold mb-8 dark:text-white flex items-center gap-2">
          <FiStar className="text-yellow-400 fill-current" /> Recent Reviews
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                {/* Product Thumbnail */}
                {review.productId && (
                  <Link href={`/product/${review.productId.slug}`} className="group shrink-0 mx-auto sm:mx-0 block">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border dark:border-slate-700">
                      <img 
                        src={review.productId.image} 
                        alt={review.productId.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                  </Link>
                )}

                {/* Review Detail */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    {review.productId ? (
                      <Link href={`/product/${review.productId.slug}`} className="font-medium text-gray-900 dark:text-white hover:text-accent transition-colors line-clamp-1 flex-1 mr-4">
                        {review.productId.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-500">Deleted Product</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex text-yellow-400 mb-3 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < review.rating ? 'fill-current' : ''} />
                    ))}
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2 dark:text-white">{review.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    "{review.comment}"
                  </p>
                  
                  {review.helpful && review.helpful.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {review.helpful.length} people found this helpful
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <FiStar className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
            <h4 className="font-medium text-lg dark:text-white mb-2">{profile.name} hasn't written any reviews yet.</h4>
            <p className="text-gray-500 dark:text-gray-400">When they do, their reviews will appear here.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
