"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackToHome?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  showBackToHome = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-o-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <ShoppingBag className="h-6 w-6" />
            <span>YourStore</span>
          </Link>
          {showBackToHome && (
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600">
              {description}
            </p>
          </div>

          {/* Form Card */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} YourStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}