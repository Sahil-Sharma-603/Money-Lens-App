"use client"; 

import { useEffect, useState } from 'react';
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

  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Greeting userName={user ? user.firstName : ''} />

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
