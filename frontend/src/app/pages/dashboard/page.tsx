'use client';

import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import Greeting from './components/Greeting';
import Daily from './components/Daily';
import Balance from './components/Balance';
import Summary from './components/Summary';
import Transactions from './components/Transactions';
import BarChartComponent from './components/BarChartComponent';
import { apiRequest, UserResponse } from '@/app/assets/utilities/API_HANDLER';

export default function Dashboard() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("here");
      try {
        const data = await apiRequest<UserResponse>('/users/user', {
          method: 'GET',
        });
  
        console.log(data.firstName);
        setUser(data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  

  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Greeting userName={user ? user.firstName : 'User'} />
          )}

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
        </div>
      </Card>
    </div>
  );
}
