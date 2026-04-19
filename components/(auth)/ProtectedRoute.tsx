// components/ProtectedRoute.tsx
'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'CUSTOMER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: userResponse, isLoading, isError } = useCurrentUser();
  const user = userResponse?.data;

  // Check authentication and authorization
  useEffect(() => {
    if (isLoading) return; // Still loading

    // Not authenticated
    if (isError || !user) {
      router.push('/login?callbackUrl=' + window.location.pathname);
      return;
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [isLoading, isError, user, requiredRole, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or unauthorized
  if (isError || !user || (requiredRole && user.role !== requiredRole)) {
    return null; // Will redirect via useEffect
  }

  // Authenticated and authorized
  return <>{children}</>;
}

// Usage in pages:
// export default function DashboardPage() {
//   return (
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   );
// }

// Usage for admin-only pages:
// export default function AdminPage() {
//   return (
//     <ProtectedRoute requiredRole="ADMIN">
//       <AdminPanel />
//     </ProtectedRoute>
//   );
// }