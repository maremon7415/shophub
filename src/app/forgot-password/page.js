'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiLoader } from 'react-icons/fi';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold font-display text-primary dark:text-white">
              Shop<span className="text-accent">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No worries, we&apos;ll send you reset instructions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We sent a password reset link to <br />
                <span className="font-medium text-gray-900 dark:text-white">{email}</span>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center text-accent hover:text-accent-hover font-medium"
              >
                <FiArrowLeft className="mr-2" /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 flex items-center justify-center"
              >
                {loading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent"
            >
              <FiArrowLeft className="mr-2" /> Back to login
            </Link>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
