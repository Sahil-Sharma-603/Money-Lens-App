<<<<<<< HEAD
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
=======
"use client"; 

import { useEffect, useState } from 'react';
>>>>>>> origin/develop
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import Greeting from './components/Greeting';
import Daily from './components/Daily';
import Balance from './components/Balance';
import Summary from './components/Summary';
import Transactions from './components/Transactions';
import BarChartComponent from './components/BarChartComponent';
import { apiRequest, UserResponse, DashboardResponse } from '@/app/assets/utilities/API_HANDLER';

export default function Dashboard() {
<<<<<<< HEAD
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
=======
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest<UserResponse>('/users/user', { method: 'GET' });
        setUser(data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchData = async () => {
      try {
        const data = await apiRequest<DashboardResponse>('/dashboard/dashboard', { method: 'GET' });
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching transaction info:', error);
      }
    };

    fetchUser();
    fetchData();
  }, []);

>>>>>>> origin/develop
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
<<<<<<< HEAD
          <Greeting />
=======
          <Greeting userName={user ? user.firstName : ''} />
>>>>>>> origin/develop

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <Daily todaySpending={dashboardData?.todaySpending ?? 0} />
            </div>
            <div style={{ flex: '1' }}>
              <Balance />
            </div>
          </div>

          <Summary />
          <BarChartComponent monthlySpending={dashboardData?.monthlySpending || []} />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
          <Transactions transactions={dashboardData?.recentTransactions || []} />
        </div>
      </Card>
    </div>
  );
}