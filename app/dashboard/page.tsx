// app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/components/(auth)/ProtectedRoute';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Link from 'next/link';

function DashboardContent() {
  const { data: userResponse, isLoading } = useCurrentUser();
  const user = userResponse?.data;
  console.log('user', user);
  
  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your account
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Email Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Email Address</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {user?.email}
                </p>
              </div>
              <div className="text-3xl">📧</div>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Phone Number</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {user?.phone || 'Not provided'}
                </p>
              </div>
              <div className="text-3xl">📱</div>
            </div>
          </div>

          {/* Role Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Account Type</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {user?.role === 'ADMIN' ? '👑 Admin' : '👤 Customer'}
                </p>
              </div>
              <div className="text-3xl">{user?.role === 'ADMIN' ? '👑' : '👤'}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl">✏️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal info</p>
              </div>
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">My Orders</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">View your order history</p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Settings</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
              </div>
            </Link>

            <Link
              href="/shop"
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl">🛍️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Continue Shopping</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse our products</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Admin Section (if user is admin) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">
              👑 Admin Section
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow transition"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dashboard</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">View analytics</p>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow transition"
              >
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Users</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage users</p>
                </div>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow transition"
              >
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Products</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage products</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    // <ProtectedRoute>
      <DashboardContent />
    // </ProtectedRoute>
  );
}