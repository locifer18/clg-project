// components/Header.tsx
'use client';

import { useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const { data: userResponse, isLoading: isUserLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [showMenu, setShowMenu] = useState(false);

  const user = userResponse?.data;
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setShowMenu(false);
        router.push('/login');
      },
    });
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ShopHub
          </Link>
        </div>

        {/* Middle - Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
            Shop
          </Link>
          <Link href="/cart" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
            Cart
          </Link>
          <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
            About
          </Link>
        </div>

        {/* Right - Auth Section */}
        <div className="flex items-center gap-4">
          {isUserLoading ? (
            // Loading skeleton
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            // Logged in - Show user menu
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {/* User Avatar */}
                <div className="relative w-8 h-8">
                  <Image
                    src={user?.image || "/default-avatar.png"}
                    alt={user?.name || "user"}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                {/* User Name */}
                <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </span>

                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      📊 Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      👤 My Profile
                    </Link>

                    <Link
                      href="/dashboard/orders"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      📦 My Orders
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      ⚙️ Settings
                    </Link>

                    {/* Admin Panel (only for admins) */}
                    {user?.role === 'ADMIN' && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <Link
                          href="/admin"
                          onClick={() => setShowMenu(false)}
                          className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-semibold"
                        >
                          🔐 Admin Panel
                        </Link>
                      </>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                    >
                      {isLoggingOut ? '🔄 Logging out...' : '🚪 Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - Show auth buttons
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}