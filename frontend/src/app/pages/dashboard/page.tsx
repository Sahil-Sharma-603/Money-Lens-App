'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import Greeting from './components/Greeting';
import Daily from './components/Daily';
import Balance from './components/Balance';
import Summary from './components/Summary';
import Transactions from './components/Transactions';
import BarChartComponent from './components/BarChartComponent';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if token exists in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // If no token is found, redirect to login page
      if (!token) {
        router.push('/');
      } else {
        // Only set checking to false if we have a token
        // This prevents flashing of content before redirect
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className={styles.dashboard}>
        <Card className={styles.fullPageCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Only render dashboard content when not checking auth
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Greeting />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <Daily />
            </div>
            <div style={{ flex: '1' }}>
              <Balance />
            </div>
          </div>

          <Summary />

          <BarChartComponent />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
          <Transactions />
          {/* This should be moved elsewhere */}
          <Link className="btn" href="/pages/plaid-setup">
            Go to Plaid Setup
          </Link>
        </div>
      </Card>
    </div>
  );
}