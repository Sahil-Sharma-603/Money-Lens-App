'use client';

import Link from 'next/link';
import Card from '../../components/Card';
import styles from '../../components/Card.module.css';
import dashboardStyles from './Dashboard.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token found, redirect to homepage
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    try {
      // Clear the token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={dashboardStyles.dashboard}>
      {/* Add logout button at the top right */}
      <div className={dashboardStyles.headerActions}>
        <button 
          onClick={handleLogout}
          className={dashboardStyles.logoutButton}
        >
          Logout
        </button>
      </div>
      
      <Card className={styles.fullPageCard} />
      <Link className="btn" href="/pages/plaid-setup">
        Go to Plaid Setup
      </Link>
    </div>
  );
}