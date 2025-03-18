'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import BarChart from './components/BarChart'; 
import CategoryPieChart from './components/CategoryPieChart'; 
import Greeting from './components/Greeting'; 
import LargestExpense from './components/LargestExpense'; 
import NetIncome from './components/NetIncome'; 
import RecurringExpenses from './components/RecurringExpenses'; 
import TopRevenueSource from './components/TopRevenueSource'; 
import { apiRequest, UserResponse, AnalysisResponse } from '@/app/assets/utilities/API_HANDLER';




export default function Analysis() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
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

  useEffect(() => {
    if (!isCheckingAuth) {
      const fetchUser = async () => {
        try {
          const data = await apiRequest<UserResponse>('/users/user', { method: 'GET' });
          setUser(data);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      
      
      fetchUser();
    }
  }, [isCheckingAuth]);
  
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


    return (
      <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style= {{display: "flex", flexDirection: "column"}}>
          <Greeting userName={user ? user.firstName : ''}/>
          <div style = {{display: "flex", flexDirection: "row"}}>
            <BarChart monthlySpending={analysisData?.monthlySpending || []}/>
  
            <CategoryPieChart spendingByCategory={analysisData?.spendingByCategory || []}/>

          </div>
          {/* <div>
            <LargestExpense />
            <TopRevenueSource> </TopRevenueSource>
            <NetIncome> </NetIncome>

          </div>
          <div>
            <RecurringExpenses> </RecurringExpenses>
          </div> */}
        </div>
      </Card>
    </div>
  );
}
