'use client';

import Link from 'next/link';
import Card from '../../components/Card';
import styles from '../../components/Card.module.css';
import dashboardStyles from './Dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    try {
      // Simply clear the token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    }
  };

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