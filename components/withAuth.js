// Protected Route HOC
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function withAuth(Component, options = {}) {
  const { requiredRoles = [] } = options;

  return function ProtectedRoute(props) {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    useEffect(() => {
      if (!loading) {
        // Not authenticated
        if (!isAuthenticated) {
          const currentPath = router.asPath;
          router.push(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        // Check role requirements
        if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
          router.push('/'); // Redirect to home if insufficient permissions
          return;
        }
      }
    }, [loading, isAuthenticated, user, router]);

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
          </div>
        </div>
      );
    }

    // Not authenticated or insufficient permissions
    if (!isAuthenticated || (requiredRoles.length > 0 && !requiredRoles.includes(user?.role))) {
      return null;
    }

    // Render component
    return <Component {...props} />;
  };
}
