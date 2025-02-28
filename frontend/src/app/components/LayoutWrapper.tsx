'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavBar from './NavBar';

// List of routes that should display the navigation bar (authenticated routes)
const AUTHENTICATED_ROUTES = [
  '/pages/dashboard',
  '/pages/transactions',
  '/pages/analytics',
  '/pages/goals',
  '/pages/settings'
];

// List of routes that should never display the navigation bar
const UNAUTHENTICATED_ROUTES = [
  '/',
  '/pages/signup',
  '/pages/forgot-password'
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNavBar, setShowNavBar] = useState(false);
  
  useEffect(() => {
    // Check if the current route is in the authenticated routes list
    // or check if the user is authenticated (has a token)
    const isAuthenticatedRoute = AUTHENTICATED_ROUTES.includes(pathname);
    const isUnauthenticatedRoute = UNAUTHENTICATED_ROUTES.includes(pathname);
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
    
    // Show navbar only when:
    // 1. It's an authenticated route AND the user has a token
    // 2. It's not explicitly an unauthenticated route AND the user has a token
    setShowNavBar((isAuthenticatedRoute && hasToken) || (!isUnauthenticatedRoute && hasToken));
  }, [pathname]);

  return (
    <div className="layout">
      {showNavBar && <NavBar />}
      <main className={showNavBar ? "noNav" : "content"}>{children}</main>
    </div>
  );
}