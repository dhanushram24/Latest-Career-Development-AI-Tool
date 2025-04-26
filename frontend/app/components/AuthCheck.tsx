// components/AuthCheck.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthCheckProps {
  children: React.ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that don't require authentication
  const isPublicRoute = 
    pathname.startsWith('/auth/') || 
    pathname === '/' || 
    pathname.startsWith('/api/');

  useEffect(() => {
    // Handle unauthenticated state for protected routes
    if (status === 'unauthenticated' && !isPublicRoute) {
      console.log('User not authenticated, redirecting to sign in page');
      router.push('/auth/signin');
    }
  }, [status, router, pathname, isPublicRoute]);

  // While checking authentication status, show a loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If on a protected route and not authenticated, don't render children
  if (status === 'unauthenticated' && !isPublicRoute) {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
}